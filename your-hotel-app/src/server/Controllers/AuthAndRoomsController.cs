using Microsoft.AspNetCore.Mvc;
using HotelApp.Server.DTOs;
using HotelApp.Server.Services;

namespace HotelApp.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new ErrorResponseDto { Error = "Username and password are required.", Code = "INVALID_PAYLOAD" });
        }

        var response = await _authService.LoginAsync(request, ct);
        if (response == null)
        {
            return Unauthorized(new ErrorResponseDto { Error = "Invalid username or password.", Code = "AUTH_INVALID_CREDENTIALS" });
        }

        return Ok(response);
    }
}

[ApiController]
[Route("api/[controller]")]
[Route("api/v1/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly IRoomService _roomService;

    public RoomsController(IRoomService roomService)
    {
        _roomService = roomService;
    }

    [HttpGet("matrix")]
    public async Task<ActionResult<List<RoomMatrixDto>>> GetMatrix(CancellationToken ct)
    {
        var matrix = await _roomService.GetRoomMatrixAsync(ct);
        return Ok(matrix);
    }

    [HttpGet("occupied")]
    public async Task<ActionResult<List<RoomUnitDto>>> GetOccupied(CancellationToken ct)
    {
        var occupied = await _roomService.GetOccupiedRoomsAsync(ct);
        return Ok(occupied);
    }
}
