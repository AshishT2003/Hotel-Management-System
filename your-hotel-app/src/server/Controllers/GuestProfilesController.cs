using Microsoft.AspNetCore.Mvc;
using HotelApp.Server.DTOs;
using HotelApp.Server.Services;

namespace HotelApp.Server.Controllers;

[ApiController]
[Route("api/guests")]
public class GuestProfilesController : ControllerBase
{
    private readonly IGuestProfileService _profileService;

    public GuestProfilesController(IGuestProfileService profileService)
    {
        _profileService = profileService;
    }

    /// <summary>
    /// Retrieve 360° guest profile by email address.
    /// </summary>
    [HttpGet("profiles/{email}")]
    public async Task<ActionResult<GuestProfileDto>> GetProfile(string email, CancellationToken ct)
    {
        var profile = await _profileService.GetProfileByEmailAsync(email, ct);
        if (profile == null) return NotFound(new { message = $"No profile found for {email}." });
        return Ok(profile);
    }

    /// <summary>
    /// Get or create a 360° guest profile.
    /// </summary>
    [HttpPost("profiles")]
    public async Task<ActionResult<GuestProfileDto>> GetOrCreateProfile([FromBody] GuestContactInfoDto contact, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(contact.Email))
            return BadRequest(new { message = "Email is required." });

        var profile = await _profileService.GetOrCreateProfileAsync(contact.Email, contact.FirstName, contact.LastName, contact.Phone, ct);
        return Ok(profile);
    }

    /// <summary>
    /// Update guest preferences (pillow, floor, dietary, allergies, room view).
    /// </summary>
    [HttpPut("profiles/{email}/preferences")]
    public async Task<ActionResult<GuestProfileDto>> UpdatePreferences(string email, [FromBody] UpdateGuestPreferencesDto dto, CancellationToken ct)
    {
        var updated = await _profileService.UpdatePreferencesAsync(email, dto, ct);
        return Ok(updated);
    }

    /// <summary>
    /// Accrue loyalty points and stay nights. Automatically calculates tier promotion.
    /// </summary>
    [HttpPost("profiles/{email}/loyalty")]
    public async Task<ActionResult<GuestProfileDto>> AccrueLoyalty(string email, [FromBody] LoyaltyPointsAccrualDto accrual, CancellationToken ct)
    {
        accrual.Email = email;
        var updated = await _profileService.AccrueLoyaltyPointsAsync(accrual, ct);
        return Ok(updated);
    }

    /// <summary>
    /// List all VIP tier guests (Platinum, Gold, Silver).
    /// </summary>
    [HttpGet("vip")]
    public async Task<ActionResult<List<GuestProfileDto>>> GetAllVip(CancellationToken ct)
    {
        var vips = await _profileService.GetAllVipGuestsAsync(ct);
        return Ok(vips);
    }
}
