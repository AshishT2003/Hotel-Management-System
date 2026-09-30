namespace HotelApp.Application.DTOs;

// ─── Auth DTOs ──────────────────────────────────────────────
public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public int ExpiresIn { get; set; } = 900;
    public string Role { get; set; } = string.Empty;
    public UserProfileDto User { get; set; } = new();
}

public class UserProfileDto
{
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

// ─── Reservation DTOs ───────────────────────────────────────
public class ReservationDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Birthday { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string EmailAddress { get; set; } = string.Empty;
    public int NumberGuest { get; set; }
    public string StreetAddress { get; set; } = string.Empty;
    public string AptSuite { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string RoomType { get; set; } = string.Empty;
    public string RoomFloor { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public double TotalBill { get; set; }
    public string PaymentType { get; set; } = string.Empty;
    public string CardType { get; set; } = string.Empty;
    public string CardNumber { get; set; } = string.Empty;
    public string CardExp { get; set; } = string.Empty;
    public string CardCvc { get; set; } = string.Empty;
    public string ArrivalTime { get; set; } = string.Empty;
    public string LeavingTime { get; set; } = string.Empty;
    public bool CheckIn { get; set; }
    public int Breakfast { get; set; }
    public int Lunch { get; set; }
    public int Dinner { get; set; }
    public bool Cleaning { get; set; }
    public bool Towel { get; set; }
    public bool Surprise { get; set; }
    public bool SupplyStatus { get; set; }
    public int FoodBill { get; set; }
}

public class CreateReservationDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Birthday { get; set; } = string.Empty;
    public string Gender { get; set; } = "Male";
    public string PhoneNumber { get; set; } = string.Empty;
    public string EmailAddress { get; set; } = string.Empty;
    public int NumberGuest { get; set; } = 1;
    public string StreetAddress { get; set; } = string.Empty;
    public string AptSuite { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = "NY";
    public string ZipCode { get; set; } = string.Empty;
    public string RoomType { get; set; } = "Single";
    public string RoomNumber { get; set; } = "101";
    public string PaymentType { get; set; } = "Credit Card";
    public string CardType { get; set; } = "Visa";
    public string CardNumber { get; set; } = string.Empty;
    public string CardExp { get; set; } = string.Empty;
    public string CardCvc { get; set; } = string.Empty;
    public DateTime ArrivalTime { get; set; }
    public DateTime LeavingTime { get; set; }
    public bool CheckIn { get; set; }
    public int Breakfast { get; set; }
    public int Lunch { get; set; }
    public int Dinner { get; set; }
    public bool Cleaning { get; set; }
    public bool Towel { get; set; }
    public bool Surprise { get; set; }
}

public class UpdateReservationDto : CreateReservationDto
{
    public int Id { get; set; }
}

// ─── Kitchen DTOs ───────────────────────────────────────────
public class OrderDto
{
    public int OrderId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public int Floor { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public int Breakfast { get; set; }
    public int Lunch { get; set; }
    public int Dinner { get; set; }
    public bool Cleaning { get; set; }
    public bool Towel { get; set; }
    public bool Surprise { get; set; }
    public bool SupplyStatus { get; set; }
    public DateTime OrderedAt { get; set; }
}

public class UpdateOrderStatusDto
{
    public bool Status { get; set; }
}

public class CheckInDto
{
    public bool CheckIn { get; set; }
}

// ─── Room Matrix DTOs ───────────────────────────────────────
public class RoomMatrixDto
{
    public int Floor { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public List<RoomUnitDto> Rooms { get; set; } = new();
}

public class RoomUnitDto
{
    public string RoomNumber { get; set; } = string.Empty;
    public string Status { get; set; } = "Available";
    public string? GuestName { get; set; }
    public int? ReservationId { get; set; }
}

// ─── Invoice DTOs ───────────────────────────────────────────
public class InvoiceDto
{
    public int ReservationId { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public string RoomType { get; set; } = string.Empty;
    public int Nights { get; set; }
    public double BaseRate { get; set; }
    public double RoomSubtotal { get; set; }
    public double GuestSurcharge { get; set; }
    public double BreakfastTotal { get; set; }
    public double LunchTotal { get; set; }
    public double DinnerTotal { get; set; }
    public double FoodTotal { get; set; }
    public double TaxAmount { get; set; }
    public double FinalTotal { get; set; }
    public string PaymentType { get; set; } = string.Empty;
    public string CardLast4 { get; set; } = string.Empty;
}

// ─── Error DTOs ─────────────────────────────────────────────
public class ErrorResponseDto
{
    public string Error { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string TraceId { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

// ─── Guest Booking DTOs ─────────────────────────────────────
public class AvailableRoomDto
{
    public int RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int Floor { get; set; }
    public decimal BaseRate { get; set; }
    public int Capacity { get; set; }
    public List<string> Amenities { get; set; } = new();
    public bool Available { get; set; } = true;
    public string? UrgencyBadge { get; set; }
}

public class GuestPartyDto
{
    public int Adults { get; set; } = 1;
    public int Children { get; set; } = 0;
}

public class GuestContactInfoDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? SpecialRequests { get; set; }
}

public class GuestMealItemDto
{
    public string Type { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}

public class GuestBookingRequestDto
{
    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public GuestPartyDto Guests { get; set; } = new();
    public GuestContactInfoDto GuestInfo { get; set; } = new();
    public List<GuestMealItemDto>? DiningPerks { get; set; }
    public List<string>? Amenities { get; set; }
    public string? PaymentMethod { get; set; } = "PayAtHotel";
}

public class BillingBreakdownDto
{
    public decimal RoomTotal { get; set; }
    public decimal DiningTotal { get; set; }
    public decimal ExtraGuestSurcharge { get; set; }
    public decimal AmenitiesTotal { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
}

public class GuestBookingResponseDto
{
    public int ReservationId { get; set; }
    public string ConfirmationCode { get; set; } = string.Empty;
    public string Status { get; set; } = "Reserved";
    public decimal TotalAmount { get; set; }
    public BillingBreakdownDto Breakdown { get; set; } = new();
    public string BookingSource { get; set; } = "Guest Portal";
    public string PaymentStatus { get; set; } = "Pending";
    public string CancellationPolicy { get; set; } = "Free cancellation up to 48 hours before check-in";
}

public class GuestBookingSummaryDto
{
    public int ReservationId { get; set; }
    public string ConfirmationCode { get; set; } = string.Empty;
    public string RoomNumber { get; set; } = string.Empty;
    public string RoomType { get; set; } = string.Empty;
    public DateTime CheckIn { get; set; }
    public DateTime CheckOut { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string BookingSource { get; set; } = string.Empty;
    public bool CanCancel { get; set; }
}

// ─── Guest Profile DTOs ─────────────────────────────────────
public class GuestProfileDto
{
    public int GuestId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string TierStatus { get; set; } = "Silver";
    public double TierMultiplier { get; set; } = 1.0;
    public int LoyaltyPoints { get; set; }
    public int TotalNights { get; set; }
    public Dictionary<string, string> Preferences { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateGuestPreferencesDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PhoneNumber { get; set; }
    public Dictionary<string, string> Preferences { get; set; } = new();
}

public class LoyaltyPointsAccrualDto
{
    public string Email { get; set; } = string.Empty;
    public decimal FolioAmount { get; set; }
    public int NightsSpent { get; set; } = 1;
}

// ─── Housekeeping DTOs ──────────────────────────────────────
public class HousekeepingTaskDto
{
    public int TaskId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string RoomType { get; set; } = "Single";
    public int Floor { get; set; } = 1;
    public string Status { get; set; } = "Ready";
    public string Priority { get; set; } = "Normal";
    public string? AttendantName { get; set; }
    public string? InspectedBy { get; set; }
    public string? Notes { get; set; }
    public DateTime? LastCleanedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateHousekeepingStatusDto
{
    public string Status { get; set; } = string.Empty;
    public string? AttendantName { get; set; }
    public string? InspectedBy { get; set; }
    public string? Notes { get; set; }
    public string? Priority { get; set; }
}

public class HousekeepingStatsDto
{
    public int TotalRooms { get; set; } = 50;
    public int ReadyCount { get; set; }
    public int DirtyCount { get; set; }
    public int CleaningCount { get; set; }
    public int InspectionCount { get; set; }
    public int VipPriorityCount { get; set; }
}
