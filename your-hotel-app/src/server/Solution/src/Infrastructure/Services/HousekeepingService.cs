using System.Collections.Concurrent;
using HotelApp.Application.DTOs;`nusing HotelApp.Application.Interfaces;
using HotelApp.Domain.Entities;
using HotelApp.Domain.Interfaces;

namespace HotelApp.Infrastructure.Services;

public interface IHousekeepingService
{
    Task<List<HousekeepingTaskDto>> GetAllTasksAsync(string? statusFilter = null, CancellationToken ct = default);
    Task<HousekeepingTaskDto?> GetTaskByRoomAsync(string roomNumber, CancellationToken ct = default);
    Task<HousekeepingTaskDto> UpdateRoomStatusAsync(string roomNumber, UpdateHousekeepingStatusDto updateDto, CancellationToken ct = default);
    Task<HousekeepingStatsDto> GetStatsAsync(CancellationToken ct = default);
    Task TriggerCheckoutCleaningAsync(string roomNumber, string? guestVipTier = null, CancellationToken ct = default);
}

public class HousekeepingService : IHousekeepingService
{
    private static readonly ConcurrentDictionary<string, HousekeepingTask> _tasks = new();
    private static readonly object _initLock = new();
    private static bool _isInitialized = false;

    private static readonly (int Floor, string Type, string[] Rooms)[] InventoryConfig = new[]
    {
        (1, "Single", new[] { "101", "102", "103", "104", "105", "106", "107", "108", "109", "110" }),
        (2, "Double", new[] { "201", "202", "203", "204", "205", "206", "207", "208", "209", "210" }),
        (3, "Twin", new[] { "301", "302", "303", "304", "305", "306", "307", "308", "309", "310" }),
        (4, "Duplex", new[] { "401", "402", "403", "404", "405", "406", "407", "408", "409", "410" }),
        (5, "Suite", new[] { "501", "502", "503", "504", "505", "506", "507", "508", "509", "510" }),
    };

    public HousekeepingService()
    {
        EnsureInitialized();
    }

    private static readonly Dictionary<string, HashSet<string>> AllowedTransitions = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Ready"] = new(StringComparer.OrdinalIgnoreCase) { "Dirty" },
        ["Dirty"] = new(StringComparer.OrdinalIgnoreCase) { "Cleaning" },
        ["Cleaning"] = new(StringComparer.OrdinalIgnoreCase) { "Inspection", "Dirty" },
        ["Inspection"] = new(StringComparer.OrdinalIgnoreCase) { "Ready", "Cleaning" }
    };

    private static void EnsureInitialized()
    {
        if (_isInitialized) return;
        lock (_initLock)
        {
            if (_isInitialized) return;

            int taskId = 1;
            foreach (var group in InventoryConfig)
            {
                foreach (var room in group.Rooms)
                {
                    string status = "Ready";
                    string priority = group.Floor == 5 ? "VIP" : "Normal";
                    string? attendant = null;
                    string? notes = null;
                    string? inspectedBy = "Chief Housekeeper";

                    if (room == "106")
                    {
                        status = "Dirty";
                        notes = "Automated turnover task after guest checkout";
                        inspectedBy = null;
                    }
                    else if (room == "104")
                    {
                        status = "Cleaning";
                        attendant = "On-Duty Attendant";
                        notes = "Departed guest turnover required";
                        inspectedBy = null;
                    }
                    else if (room == "105")
                    {
                        status = "Cleaning";
                        attendant = "Elena Rostova";
                        notes = "Stripping bed linens";
                        inspectedBy = null;
                    }
                    else if (room == "208")
                    {
                        status = "Cleaning";
                        priority = "High";
                        attendant = "On-Duty Attendant";
                        notes = "Express turnover needed for VIP arrival at 2 PM";
                        inspectedBy = null;
                    }
                    else if (room == "506")
                    {
                        status = "Cleaning";
                        priority = "VIP";
                        attendant = "Elena Rostova";
                        notes = "Jacuzzi sanitization and fresh orchids replenishment";
                        inspectedBy = null;
                    }
                    else if (room == "203")
                    {
                        status = "Inspection";
                        priority = "High";
                        attendant = "Maria Sanchez";
                        notes = "Deep cleaned, awaiting supervisor sign-off";
                        inspectedBy = null;
                    }

                    _tasks[room] = new HousekeepingTask
                    {
                        TaskId = taskId++,
                        RoomNumber = room,
                        Status = status,
                        Priority = priority,
                        AttendantName = attendant,
                        InspectedBy = inspectedBy,
                        Notes = notes,
                        LastCleanedAt = status == "Ready" ? DateTime.UtcNow.AddHours(-3) : null,
                        UpdatedAt = DateTime.UtcNow
                    };
                }
            }

            _isInitialized = true;
        }
    }

    public Task<List<HousekeepingTaskDto>> GetAllTasksAsync(string? statusFilter = null, CancellationToken ct = default)
    {
        var result = new List<HousekeepingTaskDto>();

        foreach (var group in InventoryConfig)
        {
            foreach (var room in group.Rooms)
            {
                if (_tasks.TryGetValue(room, out var task))
                {
                    if (string.IsNullOrWhiteSpace(statusFilter) || 
                        statusFilter.Equals("All", StringComparison.OrdinalIgnoreCase) || 
                        task.Status.Equals(statusFilter, StringComparison.OrdinalIgnoreCase))
                    {
                        result.Add(new HousekeepingTaskDto
                        {
                            TaskId = task.TaskId,
                            RoomNumber = task.RoomNumber,
                            RoomType = group.Type,
                            Floor = group.Floor,
                            Status = task.Status,
                            Priority = task.Priority,
                            AttendantName = task.AttendantName,
                            InspectedBy = task.InspectedBy,
                            Notes = task.Notes,
                            LastCleanedAt = task.LastCleanedAt,
                            UpdatedAt = task.UpdatedAt
                        });
                    }
                }
            }
        }

        return Task.FromResult(result);
    }

    public Task<HousekeepingTaskDto?> GetTaskByRoomAsync(string roomNumber, CancellationToken ct = default)
    {
        if (_tasks.TryGetValue(roomNumber, out var task))
        {
            int floor = int.TryParse(roomNumber.Substring(0, 1), out int f) ? f : 1;
            string type = InventoryConfig.FirstOrDefault(g => g.Floor == floor).Type ?? "Single";

            return Task.FromResult<HousekeepingTaskDto?>(new HousekeepingTaskDto
            {
                TaskId = task.TaskId,
                RoomNumber = task.RoomNumber,
                RoomType = type,
                Floor = floor,
                Status = task.Status,
                Priority = task.Priority,
                AttendantName = task.AttendantName,
                InspectedBy = task.InspectedBy,
                Notes = task.Notes,
                LastCleanedAt = task.LastCleanedAt,
                UpdatedAt = task.UpdatedAt
            });
        }

        return Task.FromResult<HousekeepingTaskDto?>(null);
    }

    public Task<HousekeepingTaskDto> UpdateRoomStatusAsync(string roomNumber, UpdateHousekeepingStatusDto updateDto, CancellationToken ct = default)
    {
        if (!_tasks.TryGetValue(roomNumber, out var task))
        {
            throw new KeyNotFoundException($"Room {roomNumber} does not exist in property matrix.");
        }

        var validStatuses = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Ready", "Dirty", "Cleaning", "Inspection" };
        if (!validStatuses.Contains(updateDto.Status))
        {
            throw new ArgumentException($"Invalid housekeeping status: '{updateDto.Status}'. Allowed: Ready, Dirty, Cleaning, Inspection.");
        }

        if (!task.Status.Equals(updateDto.Status, StringComparison.OrdinalIgnoreCase))
        {
            if (!AllowedTransitions.TryGetValue(task.Status, out var allowed) || !allowed.Contains(updateDto.Status))
            {
                throw new InvalidOperationException($"Invalid state transition: Cannot change room status from '{task.Status}' to '{updateDto.Status}'. Allowed next steps: {string.Join(", ", allowed ?? Enumerable.Empty<string>())}.");
            }
        }

        task.Status = updateDto.Status;
        if (!string.IsNullOrWhiteSpace(updateDto.AttendantName))
            task.AttendantName = updateDto.AttendantName;
        else if (updateDto.Status.Equals("Cleaning", StringComparison.OrdinalIgnoreCase) && string.IsNullOrWhiteSpace(task.AttendantName))
            task.AttendantName = "On-Duty Attendant";

        if (!string.IsNullOrWhiteSpace(updateDto.InspectedBy))
            task.InspectedBy = updateDto.InspectedBy;
        else if (updateDto.Status.Equals("Ready", StringComparison.OrdinalIgnoreCase) && string.IsNullOrWhiteSpace(task.InspectedBy))
            task.InspectedBy = "Chief Housekeeper";
        if (updateDto.Notes != null)
            task.Notes = updateDto.Notes;
        if (!string.IsNullOrWhiteSpace(updateDto.Priority))
            task.Priority = updateDto.Priority;

        if (updateDto.Status.Equals("Ready", StringComparison.OrdinalIgnoreCase))
        {
            task.LastCleanedAt = DateTime.UtcNow;
        }

        task.UpdatedAt = DateTime.UtcNow;

        int floor = int.TryParse(roomNumber.Substring(0, 1), out int f) ? f : 1;
        string type = InventoryConfig.FirstOrDefault(g => g.Floor == floor).Type ?? "Single";

        return Task.FromResult(new HousekeepingTaskDto
        {
            TaskId = task.TaskId,
            RoomNumber = task.RoomNumber,
            RoomType = type,
            Floor = floor,
            Status = task.Status,
            Priority = task.Priority,
            AttendantName = task.AttendantName,
            InspectedBy = task.InspectedBy,
            Notes = task.Notes,
            LastCleanedAt = task.LastCleanedAt,
            UpdatedAt = task.UpdatedAt
        });
    }

    public Task<HousekeepingStatsDto> GetStatsAsync(CancellationToken ct = default)
    {
        var all = _tasks.Values.ToList();
        var stats = new HousekeepingStatsDto
        {
            TotalRooms = all.Count,
            ReadyCount = all.Count(t => t.Status.Equals("Ready", StringComparison.OrdinalIgnoreCase)),
            DirtyCount = all.Count(t => t.Status.Equals("Dirty", StringComparison.OrdinalIgnoreCase)),
            CleaningCount = all.Count(t => t.Status.Equals("Cleaning", StringComparison.OrdinalIgnoreCase)),
            InspectionCount = all.Count(t => t.Status.Equals("Inspection", StringComparison.OrdinalIgnoreCase)),
            VipPriorityCount = all.Count(t => t.Priority.Equals("VIP", StringComparison.OrdinalIgnoreCase) || t.Priority.Equals("High", StringComparison.OrdinalIgnoreCase))
        };

        return Task.FromResult(stats);
    }

    public Task TriggerCheckoutCleaningAsync(string roomNumber, string? guestVipTier = null, CancellationToken ct = default)
    {
        if (_tasks.TryGetValue(roomNumber, out var task))
        {
            task.Status = "Dirty";
            task.Priority = string.Equals(guestVipTier, "Platinum", StringComparison.OrdinalIgnoreCase) ? "VIP"
                          : string.Equals(guestVipTier, "Gold", StringComparison.OrdinalIgnoreCase) ? "High"
                          : "Normal";
            task.Notes = $"Auto-queued after check-out. VIP Priority: {task.Priority}.";
            task.UpdatedAt = DateTime.UtcNow;
        }

        return Task.CompletedTask;
    }
}
