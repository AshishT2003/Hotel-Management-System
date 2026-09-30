using HotelApp.Application.DTOs;
using HotelApp.Application.Interfaces;
using HotelApp.Domain.Interfaces;

namespace HotelApp.Infrastructure.Services;

public class KitchenService : IKitchenService
{
    private readonly IReservationRepository _repo;
    public KitchenService(IReservationRepository repo) { _repo = repo; }

    public async Task<List<OrderDto>> GetActiveOrdersAsync(CancellationToken ct = default)
    {
        var reservations = await _repo.GetAllAsync(null, null, ct);
        return reservations
            .Where(r => r.Breakfast > 0 || r.Lunch > 0 || r.Dinner > 0 || r.Cleaning || r.Towel || r.Surprise)
            .OrderBy(r => r.SupplyStatus).ThenBy(r => r.Id)
            .Select(r => new OrderDto
            {
                OrderId = r.Id, RoomNumber = r.RoomNumber,
                Floor = int.TryParse(r.RoomFloor, out var f) ? f : 1,
                GuestName = $"{r.FirstName} {r.LastName}", PhoneNumber = r.PhoneNumber,
                Breakfast = r.Breakfast, Lunch = r.Lunch, Dinner = r.Dinner,
                Cleaning = r.Cleaning, Towel = r.Towel, Surprise = r.Surprise,
                SupplyStatus = r.SupplyStatus, OrderedAt = r.ArrivalTime
            }).ToList();
    }

    public async Task<bool> UpdateOrderStatusAsync(int id, bool status, CancellationToken ct = default) =>
        await _repo.UpdateSupplyStatusAsync(id, status, ct);
}
