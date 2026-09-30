using System.Collections.Concurrent;
using System.Text.Json;
using HotelApp.Application.DTOs;`nusing HotelApp.Application.Interfaces;
using HotelApp.Domain.Entities;

namespace HotelApp.Infrastructure.Services;

public interface IGuestProfileService
{
    Task<GuestProfileDto> GetOrCreateProfileAsync(string email, string? firstName = null, string? lastName = null, string? phone = null, CancellationToken ct = default);
    Task<GuestProfileDto?> GetProfileByEmailAsync(string email, CancellationToken ct = default);
    Task<GuestProfileDto> UpdatePreferencesAsync(string email, UpdateGuestPreferencesDto dto, CancellationToken ct = default);
    Task<GuestProfileDto> AccrueLoyaltyPointsAsync(LoyaltyPointsAccrualDto accrual, CancellationToken ct = default);
    Task<List<GuestProfileDto>> GetAllVipGuestsAsync(CancellationToken ct = default);
}

public class GuestProfileService : IGuestProfileService
{
    private static readonly ConcurrentDictionary<string, GuestProfile> _profiles = new(StringComparer.OrdinalIgnoreCase);
    private static int _nextId = 1;
    private static readonly object _initLock = new();
    private static bool _isInitialized = false;

    public GuestProfileService()
    {
        EnsureSeeded();
    }

    private static void EnsureSeeded()
    {
        if (_isInitialized) return;
        lock (_initLock)
        {
            if (_isInitialized) return;

            // Seed sample luxury VIP profiles
            SeedProfile("arthur.pendelton@grandhorizon.com", "Arthur", "Pendelton", "+1-555-0199", "Platinum", 45, 12500, new()
            {
                ["pillow"] = "Hypoallergenic Goose Feather",
                ["floorPreference"] = "High (Floor 5 Penthouse)",
                ["dietary"] = "Low Sodium, Gluten-Free",
                ["roomView"] = "Panoramic Skyline View",
                ["vipGreeting"] = "Chilled Dom Pérignon upon arrival"
            });

            SeedProfile("sarah.connor@skyline.org", "Sarah", "Connor", "+1-555-0144", "Gold", 18, 4800, new()
            {
                ["pillow"] = "Firm Memory Foam",
                ["floorPreference"] = "Floor 4 (Duplex)",
                ["dietary"] = "Artisan Vegetarian",
                ["roomView"] = "Courtyard Garden"
            });

            SeedProfile("james.h@apexgroup.com", "James", "Harrington", "+1-555-0177", "Silver", 4, 950, new()
            {
                ["pillow"] = "Standard Soft",
                ["floorPreference"] = "Floor 2 or 3",
                ["newspaper"] = "Financial Times"
            });

            _isInitialized = true;
        }
    }

    private static void SeedProfile(string email, string first, string last, string phone, string tier, int nights, int points, Dictionary<string, string> prefs)
    {
        _profiles[email] = new GuestProfile
        {
            GuestId = _nextId++,
            Email = email,
            FirstName = first,
            LastName = last,
            PhoneNumber = phone,
            TierStatus = tier,
            TotalNights = nights,
            LoyaltyPoints = points,
            PreferencesJson = JsonSerializer.Serialize(prefs),
            CreatedAt = DateTime.UtcNow.AddMonths(-6),
            UpdatedAt = DateTime.UtcNow
        };
    }

    public Task<GuestProfileDto> GetOrCreateProfileAsync(string email, string? firstName = null, string? lastName = null, string? phone = null, CancellationToken ct = default)
    {
        var cleanEmail = email.Trim().ToLowerInvariant();

        var profile = _profiles.GetOrAdd(cleanEmail, key => new GuestProfile
        {
            GuestId = Interlocked.Increment(ref _nextId),
            Email = key,
            FirstName = firstName ?? "Valued",
            LastName = lastName ?? "Guest",
            PhoneNumber = phone,
            TierStatus = "Silver",
            TotalNights = 0,
            LoyaltyPoints = 100, // Welcome bonus
            PreferencesJson = "{}",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        });

        // Update name/phone if provided and currently default
        if (!string.IsNullOrWhiteSpace(firstName) && profile.FirstName == "Valued")
            profile.FirstName = firstName;
        if (!string.IsNullOrWhiteSpace(lastName) && profile.LastName == "Guest")
            profile.LastName = lastName;
        if (!string.IsNullOrWhiteSpace(phone) && string.IsNullOrWhiteSpace(profile.PhoneNumber))
            profile.PhoneNumber = phone;

        return Task.FromResult(MapToDto(profile));
    }

    public Task<GuestProfileDto?> GetProfileByEmailAsync(string email, CancellationToken ct = default)
    {
        var cleanEmail = email.Trim().ToLowerInvariant();
        if (_profiles.TryGetValue(cleanEmail, out var profile))
        {
            return Task.FromResult<GuestProfileDto?>(MapToDto(profile));
        }

        return Task.FromResult<GuestProfileDto?>(null);
    }

    public Task<GuestProfileDto> UpdatePreferencesAsync(string email, UpdateGuestPreferencesDto dto, CancellationToken ct = default)
    {
        var cleanEmail = email.Trim().ToLowerInvariant();
        if (!_profiles.TryGetValue(cleanEmail, out var profile))
        {
            profile = new GuestProfile
            {
                GuestId = Interlocked.Increment(ref _nextId),
                Email = cleanEmail,
                FirstName = dto.FirstName ?? "Guest",
                LastName = dto.LastName ?? "Member",
                PhoneNumber = dto.PhoneNumber,
                TierStatus = "Silver",
                CreatedAt = DateTime.UtcNow
            };
            _profiles[cleanEmail] = profile;
        }

        if (!string.IsNullOrWhiteSpace(dto.FirstName)) profile.FirstName = dto.FirstName;
        if (!string.IsNullOrWhiteSpace(dto.LastName)) profile.LastName = dto.LastName;
        if (!string.IsNullOrWhiteSpace(dto.PhoneNumber)) profile.PhoneNumber = dto.PhoneNumber;

        if (dto.Preferences != null && dto.Preferences.Any())
        {
            var existing = ParsePreferences(profile.PreferencesJson);
            foreach (var kvp in dto.Preferences)
            {
                existing[kvp.Key] = kvp.Value;
            }
            profile.PreferencesJson = JsonSerializer.Serialize(existing);
        }

        profile.UpdatedAt = DateTime.UtcNow;
        return Task.FromResult(MapToDto(profile));
    }

    public Task<GuestProfileDto> AccrueLoyaltyPointsAsync(LoyaltyPointsAccrualDto accrual, CancellationToken ct = default)
    {
        var cleanEmail = accrual.Email.Trim().ToLowerInvariant();
        var profile = _profiles.GetOrAdd(cleanEmail, key => new GuestProfile
        {
            GuestId = Interlocked.Increment(ref _nextId),
            Email = key,
            FirstName = "Valued",
            LastName = "Guest",
            TierStatus = "Silver",
            CreatedAt = DateTime.UtcNow
        });

        profile.TotalNights += Math.Max(1, accrual.NightsSpent);

        // Recalculate tier based on total nights
        profile.TierStatus = profile.TotalNights >= 30 ? "Platinum"
                           : profile.TotalNights >= 10 ? "Gold"
                           : "Silver";

        double multiplier = profile.TierStatus switch
        {
            "Platinum" => 1.5,
            "Gold" => 1.25,
            _ => 1.0
        };

        // Points formula: 10 points per dollar spent * multiplier
        int earnedPoints = (int)Math.Round((double)accrual.FolioAmount * 10.0 * multiplier);
        profile.LoyaltyPoints += Math.Max(0, earnedPoints);
        profile.UpdatedAt = DateTime.UtcNow;

        return Task.FromResult(MapToDto(profile));
    }

    public Task<List<GuestProfileDto>> GetAllVipGuestsAsync(CancellationToken ct = default)
    {
        var list = _profiles.Values
            .OrderByDescending(p => p.TierStatus == "Platinum" ? 3 : p.TierStatus == "Gold" ? 2 : 1)
            .ThenByDescending(p => p.LoyaltyPoints)
            .Select(MapToDto)
            .ToList();

        return Task.FromResult(list);
    }

    private static GuestProfileDto MapToDto(GuestProfile p)
    {
        double multiplier = p.TierStatus switch
        {
            "Platinum" => 1.5,
            "Gold" => 1.25,
            _ => 1.0
        };

        return new GuestProfileDto
        {
            GuestId = p.GuestId,
            Email = p.Email,
            FirstName = p.FirstName,
            LastName = p.LastName,
            PhoneNumber = p.PhoneNumber,
            TierStatus = p.TierStatus,
            TierMultiplier = multiplier,
            LoyaltyPoints = p.LoyaltyPoints,
            TotalNights = p.TotalNights,
            Preferences = ParsePreferences(p.PreferencesJson),
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };
    }

    private static Dictionary<string, string> ParsePreferences(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new();
        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, string>>(json) ?? new();
        }
        catch
        {
            return new();
        }
    }
}
