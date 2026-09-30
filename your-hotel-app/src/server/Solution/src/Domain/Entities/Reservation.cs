namespace HotelApp.Domain.Entities;

/// <summary>
/// Hotel reservation entity — migrated from the legacy flat structure.
/// </summary>
public class Reservation
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Birthday { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string EmailAddress { get; set; } = string.Empty;
    public int NumberGuest { get; set; } = 1;
    public string StreetAddress { get; set; } = string.Empty;
    public string AptSuite { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string RoomType { get; set; } = "Single";
    public string RoomFloor { get; set; } = "1";
    public string RoomNumber { get; set; } = "101";
    public double TotalBill { get; set; }
    public string PaymentType { get; set; } = "Credit Card";
    public string CardType { get; set; } = "Visa";
    public string CardNumber { get; set; } = string.Empty;
    public string CardExp { get; set; } = string.Empty;
    public string CardCvc { get; set; } = string.Empty;
    public DateTime ArrivalTime { get; set; } = DateTime.UtcNow;
    public DateTime LeavingTime { get; set; } = DateTime.UtcNow.AddDays(1);
    public bool CheckIn { get; set; }
    public int Breakfast { get; set; }
    public int Lunch { get; set; }
    public int Dinner { get; set; }
    public bool Cleaning { get; set; }
    public bool Towel { get; set; }
    public bool Surprise { get; set; }
    public bool SupplyStatus { get; set; }
    public int FoodBill { get; set; }
    public string BookingSource { get; set; } = "Staff";
    public string PaymentStatus { get; set; } = "Pending";
    public string ConfirmationCode { get; set; } = string.Empty;
    public string SpecialRequests { get; set; } = string.Empty;
    public string Status { get; set; } = "Reserved";
    public string CancellationPolicy { get; set; } = "Free cancellation up to 48 hours before check-in";
}
