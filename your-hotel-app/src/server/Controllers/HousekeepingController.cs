using Microsoft.AspNetCore.Mvc;
using HotelApp.Server.DTOs;
using HotelApp.Server.Services;

namespace HotelApp.Server.Controllers;

[ApiController]
[Route("api/housekeeping")]
public class HousekeepingController : ControllerBase
{
    private readonly IHousekeepingService _housekeepingService;

    public HousekeepingController(IHousekeepingService housekeepingService)
    {
        _housekeepingService = housekeepingService;
    }

    /// <summary>
    /// Get all room housekeeping tasks with optional status filter (All, Ready, Dirty, Cleaning, Inspection).
    /// </summary>
    [HttpGet("tasks")]
    public async Task<ActionResult<List<HousekeepingTaskDto>>> GetAllTasks([FromQuery] string? status, CancellationToken ct)
    {
        var tasks = await _housekeepingService.GetAllTasksAsync(status, ct);
        return Ok(tasks);
    }

    /// <summary>
    /// Get housekeeping status for a specific room number.
    /// </summary>
    [HttpGet("tasks/{roomNumber}")]
    public async Task<ActionResult<HousekeepingTaskDto>> GetTaskByRoom(string roomNumber, CancellationToken ct)
    {
        var task = await _housekeepingService.GetTaskByRoomAsync(roomNumber, ct);
        if (task == null) return NotFound(new { message = $"Room {roomNumber} not found." });
        return Ok(task);
    }

    /// <summary>
    /// Update housekeeping status (Ready, Dirty, Cleaning, Inspection) and assign attendant.
    /// </summary>
    [HttpPatch("rooms/{roomNumber}/status")]
    public async Task<ActionResult<HousekeepingTaskDto>> UpdateStatus(string roomNumber, [FromBody] UpdateHousekeepingStatusDto dto, CancellationToken ct)
    {
        try
        {
            var updated = await _housekeepingService.UpdateRoomStatusAsync(roomNumber, dto, ct);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Aggregate counts of rooms by cleaning status.
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<HousekeepingStatsDto>> GetStats(CancellationToken ct)
    {
        var stats = await _housekeepingService.GetStatsAsync(ct);
        return Ok(stats);
    }

    /// <summary>
    /// Trigger checkout turnover clean for a room.
    /// </summary>
    [HttpPost("rooms/{roomNumber}/checkout-clean")]
    public async Task<ActionResult> TriggerCheckoutClean(string roomNumber, [FromQuery] string? vipTier, CancellationToken ct)
    {
        await _housekeepingService.TriggerCheckoutCleaningAsync(roomNumber, vipTier, ct);
        return Ok(new { message = $"Room {roomNumber} marked Dirty for checkout turnover." });
    }
}
