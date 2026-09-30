using Microsoft.AspNetCore.Mvc;
using HotelApp.Server.DTOs;
using HotelApp.Server.Services;

namespace HotelApp.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Route("api/v1/[controller]")]
public class ReservationsController : ControllerBase
{
    private readonly IReservationService _reservationService;

    public ReservationsController(IReservationService reservationService)
    {
        _reservationService = reservationService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ReservationDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status,
        CancellationToken ct)
    {
        var results = await _reservationService.GetAllAsync(search, status, ct);
        return Ok(results);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ReservationDto>> GetById(int id, CancellationToken ct)
    {
        var result = await _reservationService.GetByIdAsync(id, ct);
        if (result == null)
            return NotFound(new ErrorResponseDto { Error = $"Reservation #{id} not found.", Code = "NOT_FOUND" });

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ReservationDto>> Create([FromBody] CreateReservationDto dto, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto.FirstName) || string.IsNullOrWhiteSpace(dto.LastName))
        {
            return BadRequest(new ErrorResponseDto { Error = "Guest first and last names are required.", Code = "VALIDATION_FAILED" });
        }

        try
        {
            var created = await _reservationService.CreateAsync(dto, ct);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ErrorResponseDto { Error = ex.Message, Code = "ROOM_CONFLICT" });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateReservationDto dto, CancellationToken ct)
    {
        try
        {
            var updated = await _reservationService.UpdateAsync(id, dto, ct);
            if (!updated)
                return NotFound(new ErrorResponseDto { Error = $"Reservation #{id} not found.", Code = "NOT_FOUND" });

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ErrorResponseDto { Error = ex.Message, Code = "ROOM_CONFLICT" });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var deleted = await _reservationService.DeleteAsync(id, ct);
        if (!deleted)
            return NotFound(new ErrorResponseDto { Error = $"Reservation #{id} not found.", Code = "NOT_FOUND" });

        return NoContent();
    }

    [HttpPatch("{id:int}/checkin")]
    public async Task<IActionResult> ToggleCheckIn(int id, [FromBody] CheckInDto dto, CancellationToken ct)
    {
        var updated = await _reservationService.ToggleCheckInAsync(id, dto.CheckIn, ct);
        if (!updated)
            return NotFound(new ErrorResponseDto { Error = $"Reservation #{id} not found.", Code = "NOT_FOUND" });

        return Ok(new { id, checkIn = dto.CheckIn, message = $"Guest successfully {(dto.CheckIn ? "checked in" : "checked out")}." });
    }

    [HttpGet("{id:int}/invoice")]
    public async Task<ActionResult<InvoiceDto>> GetInvoice(int id, CancellationToken ct)
    {
        var invoice = await _reservationService.GetInvoiceAsync(id, ct);
        if (invoice == null)
            return NotFound(new ErrorResponseDto { Error = $"Reservation #{id} not found.", Code = "NOT_FOUND" });

        return Ok(invoice);
    }
}

[ApiController]
[Route("api/[controller]")]
[Route("api/v1/[controller]")]
public class KitchenController : ControllerBase
{
    private readonly IKitchenService _kitchenService;

    public KitchenController(IKitchenService kitchenService)
    {
        _kitchenService = kitchenService;
    }

    [HttpGet("orders")]
    public async Task<ActionResult<List<OrderDto>>> GetOrders(CancellationToken ct)
    {
        var orders = await _kitchenService.GetActiveOrdersAsync(ct);
        return Ok(orders);
    }

    [HttpPut("orders/{id:int}/status")]
    [HttpPatch("orders/{id:int}")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto, CancellationToken ct)
    {
        var updated = await _kitchenService.UpdateOrderStatusAsync(id, dto.Status, ct);
        if (!updated)
            return NotFound(new ErrorResponseDto { Error = $"Order for reservation #{id} not found.", Code = "NOT_FOUND" });

        return Ok(new { orderId = id, supplyStatus = dto.Status, message = $"Order marked as {(dto.Status ? "Served" : "Pending")}." });
    }
}
