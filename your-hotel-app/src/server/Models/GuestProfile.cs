namespace HotelApp.Server.Models;

public class GuestProfile
{
    public int GuestId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string TierStatus { get; set; } = "Silver"; // 'Silver', 'Gold', 'Platinum'
    public int LoyaltyPoints { get; set; } = 0;
    public int TotalNights { get; set; } = 0;
    public string? PreferencesJson { get; set; } // JSON formatted preferences string
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
