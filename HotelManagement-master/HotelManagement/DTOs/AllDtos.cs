namespace HotelApp.Server.DTOs;

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public int ExpiresIn { get; set; } = 900; // 15 mins
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
    public string Status { get; set; } = "Available"; // "Available", "Reserved", "Occupied"
    public string? GuestName { get; set; }
    public int? ReservationId { get; set; }
}

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

public class ErrorResponseDto
{
    public string Error { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string TraceId { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
