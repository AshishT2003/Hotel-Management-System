namespace HotelApp.Server.DTOs;

public class HousekeepingTaskDto
{
    public int TaskId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string RoomType { get; set; } = "Single";
    public int Floor { get; set; } = 1;
    public string Status { get; set; } = "Ready"; // 'Ready', 'Dirty', 'Cleaning', 'Inspection'
    public string Priority { get; set; } = "Normal"; // 'Normal', 'High', 'VIP'
    public string? AttendantName { get; set; }
    public string? InspectedBy { get; set; }
    public string? Notes { get; set; }
    public DateTime? LastCleanedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateHousekeepingStatusDto
{
    public string Status { get; set; } = string.Empty; // 'Ready', 'Dirty', 'Cleaning', 'Inspection'
    public string? AttendantName { get; set; }
    public string? InspectedBy { get; set; }
    public string? Notes { get; set; }
    public string? Priority { get; set; }
}

public class HousekeepingStatsDto
{
    public int TotalRooms { get; set; } = 50;
    public int ReadyCount { get; set; }
    public int DirtyCount { get; set; }
    public int CleaningCount { get; set; }
    public int InspectionCount { get; set; }
    public int VipPriorityCount { get; set; }
}
