namespace HotelApp.Server.DTOs;

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
