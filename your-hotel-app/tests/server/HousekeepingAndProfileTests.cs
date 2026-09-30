using HotelApp.Server.Controllers;
using HotelApp.Server.DTOs;
using HotelApp.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace HotelApp.Tests.Server;

public class HousekeepingAndProfileTests
{
    private readonly HousekeepingService _housekeepingService;
    private readonly GuestProfileService _profileService;

    public HousekeepingAndProfileTests()
    {
        _housekeepingService = new HousekeepingService();
        _profileService = new GuestProfileService();
    }

    [Fact]
    public async Task GetAllTasks_ReturnsAll50Rooms()
    {
        // Act
        var tasks = await _housekeepingService.GetAllTasksAsync();

        // Assert
        Assert.NotNull(tasks);
        Assert.Equal(50, tasks.Count);
        Assert.Contains(tasks, t => t.RoomNumber == "101");
        Assert.Contains(tasks, t => t.RoomNumber == "510");
    }

    [Fact]
    public async Task UpdateRoomStatus_StateTransitions_Succeeds()
    {
        // 1. Mark Dirty
        var dirty = await _housekeepingService.UpdateRoomStatusAsync("102", new UpdateHousekeepingStatusDto
        {
            Status = "Dirty",
            Notes = "Guest checked out"
        });
        Assert.Equal("Dirty", dirty.Status);

        // 2. Mark Cleaning in progress
        var cleaning = await _housekeepingService.UpdateRoomStatusAsync("102", new UpdateHousekeepingStatusDto
        {
            Status = "Cleaning",
            AttendantName = "Elena Rostova"
        });
        Assert.Equal("Cleaning", cleaning.Status);
        Assert.Equal("Elena Rostova", cleaning.AttendantName);

        // 3. Mark Inspection Required
        var inspection = await _housekeepingService.UpdateRoomStatusAsync("102", new UpdateHousekeepingStatusDto
        {
            Status = "Inspection"
        });
        Assert.Equal("Inspection", inspection.Status);

        // 4. Mark Ready
        var ready = await _housekeepingService.UpdateRoomStatusAsync("102", new UpdateHousekeepingStatusDto
        {
            Status = "Ready",
            InspectedBy = "Supervisor Jane"
        });
        Assert.Equal("Ready", ready.Status);
        Assert.NotNull(ready.LastCleanedAt);
    }

    [Fact]
    public async Task UpdateRoomStatus_InvalidStatus_ThrowsArgumentException()
    {
        await Assert.ThrowsAsync<ArgumentException>(() =>
            _housekeepingService.UpdateRoomStatusAsync("101", new UpdateHousekeepingStatusDto
            {
                Status = "NonExistentStatus"
            })
        );
    }

    [Fact]
    public async Task UpdateRoomStatus_InvalidTransition_ThrowsInvalidOperationException()
    {
        // Room 101 starts in 'Ready' status. Transitioning directly to 'Inspection' or 'Ready' is illegal.
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _housekeepingService.UpdateRoomStatusAsync("101", new UpdateHousekeepingStatusDto
            {
                Status = "Inspection"
            })
        );
    }

    [Fact]
    public async Task GetStats_ReconcilesExactlyToFiftyRooms()
    {
        var stats = await _housekeepingService.GetStatsAsync();
        Assert.NotNull(stats);
        Assert.Equal(50, stats.TotalRooms);
        Assert.Equal(44, stats.ReadyCount);
        Assert.Equal(1, stats.DirtyCount);
        Assert.Equal(4, stats.CleaningCount);
        Assert.Equal(1, stats.InspectionCount);
        Assert.Equal(50, stats.ReadyCount + stats.DirtyCount + stats.CleaningCount + stats.InspectionCount);
    }

    [Fact]
    public async Task TriggerCheckoutCleaning_SetsVipPriorityCorrectly()
    {
        // Act
        await _housekeepingService.TriggerCheckoutCleaningAsync("501", "Platinum");
        var task = await _housekeepingService.GetTaskByRoomAsync("501");

        // Assert
        Assert.NotNull(task);
        Assert.Equal("Dirty", task.Status);
        Assert.Equal("VIP", task.Priority);
    }

    [Fact]
    public async Task GuestProfile_LoyaltyTierPromotion_AndPointAccrual()
    {
        string testEmail = $"vip.test.{Guid.NewGuid():N}@luxuryguest.com";

        // 1. Create Profile
        var profile = await _profileService.GetOrCreateProfileAsync(testEmail, "Alexander", "Pierce", "+1-555-9000");
        Assert.Equal("Silver", profile.TierStatus);
        Assert.Equal(1.0, profile.TierMultiplier);
        Assert.Equal(100, profile.LoyaltyPoints); // welcome bonus

        // 2. Accrue 12 nights (Promotes to Gold)
        var goldProfile = await _profileService.AccrueLoyaltyPointsAsync(new LoyaltyPointsAccrualDto
        {
            Email = testEmail,
            FolioAmount = 2000m,
            NightsSpent = 12
        });

        Assert.Equal("Gold", goldProfile.TierStatus);
        Assert.Equal(1.25, goldProfile.TierMultiplier);
        // Points: 100 + (2000 * 10 * 1.25) = 100 + 25000 = 25100
        Assert.Equal(25100, goldProfile.LoyaltyPoints);

        // 3. Accrue 20 more nights (Total 32 nights -> Promotes to Platinum)
        var platinumProfile = await _profileService.AccrueLoyaltyPointsAsync(new LoyaltyPointsAccrualDto
        {
            Email = testEmail,
            FolioAmount = 5000m,
            NightsSpent = 20
        });

        Assert.Equal("Platinum", platinumProfile.TierStatus);
        Assert.Equal(1.5, platinumProfile.TierMultiplier);
        // Points: 25100 + (5000 * 10 * 1.5) = 25100 + 75000 = 100100
        Assert.Equal(100100, platinumProfile.LoyaltyPoints);
    }

    [Fact]
    public async Task GuestProfile_UpdatePreferences_PersistsCustomPreferences()
    {
        string testEmail = $"pref.test.{Guid.NewGuid():N}@luxuryguest.com";

        await _profileService.UpdatePreferencesAsync(testEmail, new UpdateGuestPreferencesDto
        {
            FirstName = "Lady",
            LastName = "Eleanor",
            Preferences = new()
            {
                ["pillow"] = "Lavender Infused Silk",
                ["champagne"] = "Dom Pérignon Vintage"
            }
        });

        var profile = await _profileService.GetProfileByEmailAsync(testEmail);
        Assert.NotNull(profile);
        Assert.Equal("Lady", profile.FirstName);
        Assert.Equal("Lavender Infused Silk", profile.Preferences["pillow"]);
        Assert.Equal("Dom Pérignon Vintage", profile.Preferences["champagne"]);
    }
}
