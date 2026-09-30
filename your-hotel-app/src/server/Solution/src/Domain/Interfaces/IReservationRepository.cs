using HotelApp.Domain.Entities;

namespace HotelApp.Domain.Interfaces;

public interface IReservationRepository
{
    Task<List<Reservation>> GetAllAsync(string? search = null, string? status = null, CancellationToken ct = default);
    Task<Reservation?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Reservation> CreateAsync(Reservation reservation, CancellationToken ct = default);
    Task<bool> UpdateAsync(Reservation reservation, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
    Task<bool> UpdateCheckInAsync(int id, bool checkIn, CancellationToken ct = default);
    Task<bool> UpdateSupplyStatusAsync(int id, bool supplyStatus, CancellationToken ct = default);
    Task<bool> IsRoomBookedAsync(string roomNumber, DateTime arrival, DateTime leaving, int? excludeId = null, CancellationToken ct = default);
}
