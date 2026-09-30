using HotelApp.Application.DTOs;

namespace HotelApp.Application.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllAsync(CancellationToken ct = default);
    Task<ProductDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken ct = default);
    Task<ProductDto?> UpdateAsync(int id, UpdateProductDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}

public interface IItemService
{
    Task<IEnumerable<ItemDto>> GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<ItemDto>> GetByProductIdAsync(int productId, CancellationToken ct = default);
    Task<ItemDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ItemDto> CreateAsync(CreateItemDto dto, CancellationToken ct = default);
    Task<ItemDto?> UpdateAsync(int id, UpdateItemDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}

// ─── Hotel Service Interfaces (migrated from legacy) ────────
public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default);
}

public interface IReservationService
{
    Task<List<ReservationDto>> GetAllAsync(string? search = null, string? status = null, CancellationToken ct = default);
    Task<ReservationDto?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ReservationDto> CreateAsync(CreateReservationDto dto, CancellationToken ct = default);
    Task<bool> UpdateAsync(int id, CreateReservationDto dto, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
    Task<bool> ToggleCheckInAsync(int id, bool checkIn, CancellationToken ct = default);
    Task<InvoiceDto?> GetInvoiceAsync(int id, CancellationToken ct = default);
}

public interface IBillingService
{
    (double RoomSubtotal, double GuestSurcharge, double FoodBill, double TaxAmount, double FinalTotal) CalculateBill(
        string roomType, int guests, int nights, int breakfast, int lunch, int dinner);

    (double RoomSubtotal, double GuestSurcharge, double FoodBill, double TaxAmount, double FinalTotal) CalculateBill(
        Domain.Entities.Reservation reservation);
}

public interface IKitchenService
{
    Task<List<OrderDto>> GetActiveOrdersAsync(CancellationToken ct = default);
    Task<bool> UpdateOrderStatusAsync(int id, bool status, CancellationToken ct = default);
}

public interface IRoomService
{
    Task<List<RoomMatrixDto>> GetRoomMatrixAsync(CancellationToken ct = default);
    Task<List<RoomUnitDto>> GetOccupiedRoomsAsync(CancellationToken ct = default);
}

public interface IGuestBookingService
{
    Task<List<AvailableRoomDto>> GetAvailableRoomsAsync(DateTime checkIn, DateTime checkOut, int guests, CancellationToken ct = default);
    Task<GuestBookingResponseDto> CreateGuestBookingAsync(GuestBookingRequestDto request, CancellationToken ct = default);
    Task<List<GuestBookingSummaryDto>> GetGuestBookingsByEmailAsync(string email, CancellationToken ct = default);
    Task<bool> CancelGuestBookingAsync(int id, string email, CancellationToken ct = default);
}

public interface IGuestProfileService
{
    Task<GuestProfileDto> GetOrCreateProfileAsync(string email, string? firstName = null, string? lastName = null, string? phone = null, CancellationToken ct = default);
    Task<GuestProfileDto?> GetProfileByEmailAsync(string email, CancellationToken ct = default);
    Task<GuestProfileDto> UpdatePreferencesAsync(string email, UpdateGuestPreferencesDto dto, CancellationToken ct = default);
    Task<GuestProfileDto> AccrueLoyaltyPointsAsync(LoyaltyPointsAccrualDto accrual, CancellationToken ct = default);
    Task<List<GuestProfileDto>> GetAllVipGuestsAsync(CancellationToken ct = default);
}

public interface IHousekeepingService
{
    Task<List<HousekeepingTaskDto>> GetAllTasksAsync(string? statusFilter = null, CancellationToken ct = default);
    Task<HousekeepingTaskDto?> GetTaskByRoomAsync(string roomNumber, CancellationToken ct = default);
    Task<HousekeepingTaskDto> UpdateRoomStatusAsync(string roomNumber, UpdateHousekeepingStatusDto updateDto, CancellationToken ct = default);
    Task<HousekeepingStatsDto> GetStatsAsync(CancellationToken ct = default);
    Task TriggerCheckoutCleaningAsync(string roomNumber, string? guestVipTier = null, CancellationToken ct = default);
}
