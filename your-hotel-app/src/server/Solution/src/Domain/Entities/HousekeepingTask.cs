namespace HotelApp.Domain.Entities;

public class HousekeepingTask
{
    public int TaskId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string Status { get; set; } = "Ready";
    public string Priority { get; set; } = "Normal";
    public string? AttendantName { get; set; }
    public string? InspectedBy { get; set; }
    public string? Notes { get; set; }
    public DateTime? LastCleanedAt { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
