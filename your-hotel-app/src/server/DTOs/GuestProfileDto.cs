namespace HotelApp.Server.DTOs;

public class GuestProfileDto
{
    public int GuestId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string TierStatus { get; set; } = "Silver"; // Silver, Gold, Platinum
    public double TierMultiplier { get; set; } = 1.0;
    public int LoyaltyPoints { get; set; }
    public int TotalNights { get; set; }
    public Dictionary<string, string> Preferences { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateGuestPreferencesDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PhoneNumber { get; set; }
    public Dictionary<string, string> Preferences { get; set; } = new();
}

public class LoyaltyPointsAccrualDto
{
    public string Email { get; set; } = string.Empty;
    public decimal FolioAmount { get; set; }
    public int NightsSpent { get; set; } = 1;
}
