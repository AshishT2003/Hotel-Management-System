using HotelApp.Application.DTOs;
using HotelApp.Application.Interfaces;
using HotelApp.Domain.Interfaces;

namespace HotelApp.Infrastructure.Services;

public class RoomService : IRoomService
{
    private readonly IReservationRepository _repo;
    private static readonly (int Floor, string Type, decimal Price, string[] Rooms)[] FloorConfig = new[]
    {
        (1, "Single", 149.0m, new[] { "101","102","103","104","105","106","107","108","109","110" }),
        (2, "Double", 299.0m, new[] { "201","202","203","204","205","206","207","208","209","210" }),
        (3, "Twin", 349.0m, new[] { "301","302","303","304","305","306","307","308","309","310" }),
        (4, "Duplex", 399.0m, new[] { "401","402","403","404","405","406","407","408","409","410" }),
        (5, "Suite", 499.0m, new[] { "501","502","503","504","505","506","507","508","509","510" }),
    };

    public RoomService(IReservationRepository repo) { _repo = repo; }

    public async Task<List<RoomMatrixDto>> GetRoomMatrixAsync(CancellationToken ct = default)
    {
        var reservations = await _repo.GetAllAsync(null, null, ct);
        var activeMap = reservations.GroupBy(r => r.RoomNumber.Trim())
            .ToDictionary(g => g.Key, g => g.OrderByDescending(r => r.CheckIn).ThenByDescending(r => r.Id).First());

        var matrix = new List<RoomMatrixDto>();
        foreach (var (floor, type, price, rooms) in FloorConfig)
        {
            var floorDto = new RoomMatrixDto { Floor = floor, Type = type, Price = price, Rooms = new List<RoomUnitDto>() };
            foreach (var rNum in rooms)
            {
                activeMap.TryGetValue(rNum, out var matched);
                floorDto.Rooms.Add(new RoomUnitDto
                {
                    RoomNumber = rNum,
                    Status = matched == null ? "Available" : (matched.CheckIn ? "Occupied" : "Reserved"),
                    GuestName = matched != null ? $"{matched.FirstName} {matched.LastName}" : null,
                    ReservationId = matched?.Id
                });
            }
            matrix.Add(floorDto);
        }
        return matrix;
    }

    public async Task<List<RoomUnitDto>> GetOccupiedRoomsAsync(CancellationToken ct = default)
    {
        var reservations = await _repo.GetAllAsync(null, null, ct);
        return reservations.Where(r => r.CheckIn)
            .Select(r => new RoomUnitDto { RoomNumber = r.RoomNumber, Status = "Occupied", GuestName = $"{r.FirstName} {r.LastName}", ReservationId = r.Id })
            .ToList();
    }
}
