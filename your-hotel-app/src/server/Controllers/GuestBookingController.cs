using Microsoft.AspNetCore.Mvc;
using HotelApp.Server.DTOs;
using HotelApp.Server.Services;

namespace HotelApp.Server.Controllers;

[ApiController]
[Route("api/guest")]
public class GuestBookingController : ControllerBase
{
    private readonly IGuestBookingService _guestService;

    public GuestBookingController(IGuestBookingService guestService)
    {
        _guestService = guestService;
    }

    /// <summary>
    /// Search available rooms for a given stay period and party size.
    /// </summary>
    [HttpGet("rooms/available")]
    public async Task<ActionResult<List<AvailableRoomDto>>> GetAvailableRooms(
        [FromQuery] DateTime? checkIn,
        [FromQuery] DateTime? checkOut,
        [FromQuery] int guests = 1,
        CancellationToken ct = default)
    {
        var start = checkIn ?? DateTime.UtcNow.Date.AddDays(1);
        var end = checkOut ?? start.AddDays(1);

        if (end <= start)
        {
            return BadRequest(new ErrorResponseDto 
            { 
                Error = "Check-out date must be strictly after check-in date.", 
                Code = "INVALID_DATE_RANGE" 
            });
        }

        var available = await _guestService.GetAvailableRoomsAsync(start, end, guests, ct);
        return Ok(available);
    }

    /// <summary>
    /// Direct self-service guest booking endpoint with 7% tax calculation.
    /// </summary>
    [HttpPost("book")]
    public async Task<ActionResult<GuestBookingResponseDto>> BookRoom(
        [FromBody] GuestBookingRequestDto request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.RoomNumber))
        {
            return BadRequest(new ErrorResponseDto { Error = "Room selection is required.", Code = "ROOM_REQUIRED" });
        }

        if (string.IsNullOrWhiteSpace(request.GuestInfo?.FirstName) || 
            string.IsNullOrWhiteSpace(request.GuestInfo?.LastName) ||
            string.IsNullOrWhiteSpace(request.GuestInfo?.Email))
        {
            return BadRequest(new ErrorResponseDto 
            { 
                Error = "Guest full name and email address are required.", 
                Code = "GUEST_INFO_REQUIRED" 
            });
        }

        try
        {
            var response = await _guestService.CreateGuestBookingAsync(request, ct);
            return StatusCode(201, response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ErrorResponseDto { Error = ex.Message, Code = "INVALID_INPUT" });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ErrorResponseDto { Error = ex.Message, Code = "ROOM_UNAVAILABLE" });
        }
    }

    /// <summary>
    /// Retrieve all reservations associated with a guest email.
    /// </summary>
    [HttpGet("bookings/{email}")]
    public async Task<ActionResult<List<GuestBookingSummaryDto>>> GetBookingsByEmail(
        string email,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new ErrorResponseDto { Error = "Email is required.", Code = "EMAIL_REQUIRED" });
        }

        var bookings = await _guestService.GetGuestBookingsByEmailAsync(email, ct);
        return Ok(bookings);
    }

    public class CancelBookingRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    /// <summary>
    /// Cancel a guest's booking (Free if > 48 hours before check-in).
    /// </summary>
    [HttpDelete("bookings/{id:int}/cancel")]
    public async Task<IActionResult> CancelBookingDelete(
        int id,
        [FromQuery] string email,
        CancellationToken ct)
    {
        return await ProcessCancellation(id, email, ct);
    }

    [HttpPost("bookings/{id:int}/cancel")]
    public async Task<IActionResult> CancelBookingPost(
        int id,
        [FromBody] CancelBookingRequest request,
        CancellationToken ct)
    {
        return await ProcessCancellation(id, request.Email, ct);
    }

    private async Task<IActionResult> ProcessCancellation(int id, string email, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new ErrorResponseDto { Error = "Email is required to verify booking ownership.", Code = "EMAIL_REQUIRED" });
        }

        try
        {
            var success = await _guestService.CancelGuestBookingAsync(id, email, ct);
            if (!success)
            {
                return NotFound(new ErrorResponseDto { Error = $"Booking #{id} not found.", Code = "NOT_FOUND" });
            }

            return Ok(new { message = $"Booking #{id} has been successfully cancelled. The room has been released.", id, status = "Cancelled" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new ErrorResponseDto { Error = ex.Message, Code = "UNAUTHORIZED_BOOKING_ACCESS" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ErrorResponseDto { Error = ex.Message, Code = "CANCELLATION_POLICY_EXPIRED" });
        }
    }
}
