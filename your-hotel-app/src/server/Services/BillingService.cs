using HotelApp.Server.Models;

namespace HotelApp.Server.Services;

public interface IBillingService
{
    (double RoomSubtotal, double GuestSurcharge, double FoodBill, double TaxAmount, double FinalTotal) CalculateBill(
        string roomType, int guests, int nights, int breakfast, int lunch, int dinner);

    (double RoomSubtotal, double GuestSurcharge, double FoodBill, double TaxAmount, double FinalTotal) CalculateBill(
        Reservation reservation);
}

public class BillingService : IBillingService
{
    private static readonly Dictionary<string, double> RoomRates = new(StringComparer.OrdinalIgnoreCase)
    {
        { "Single", 149.0 },
        { "Double", 299.0 },
        { "Twin", 349.0 },
        { "Duplex", 399.0 },
        { "Suite", 499.0 }
    };

    public const double BreakfastPrice = 7.0;
    public const double LunchPrice = 12.0;
    public const double DinnerPrice = 15.0;
    public const double TaxRate = 0.07; // 7%

    public (double RoomSubtotal, double GuestSurcharge, double FoodBill, double TaxAmount, double FinalTotal) CalculateBill(
        string roomType, int guests, int nights, int breakfast, int lunch, int dinner)
    {
        double baseRate = RoomRates.TryGetValue(roomType.Trim(), out var rate) ? rate : 149.0;
        int duration = Math.Max(1, nights);
        double roomSubtotal = baseRate * duration;

        // Extra guest surcharge: (G - 2) * $25 for G >= 3
        double guestSurcharge = guests >= 3 ? (guests - 2) * 25.0 : 0.0;

        // Food charges
        double foodBill = (breakfast * BreakfastPrice) + (lunch * LunchPrice) + (dinner * DinnerPrice);

        // Tax: 7% on (RoomSubtotal + GuestSurcharge + FoodBill)
        double taxableAmount = roomSubtotal + guestSurcharge + foodBill;
        double taxAmount = Math.Round(taxableAmount * TaxRate, 2);

        // Invoiced Total = 1.07 * (R + E + M)
        double finalTotal = Math.Round(taxableAmount + taxAmount, 2);

        return (roomSubtotal, guestSurcharge, foodBill, taxAmount, finalTotal);
    }

    public (double RoomSubtotal, double GuestSurcharge, double FoodBill, double TaxAmount, double FinalTotal) CalculateBill(
        Reservation reservation)
    {
        int nights = Math.Max(1, (int)(reservation.LeavingTime.Date - reservation.ArrivalTime.Date).TotalDays);
        return CalculateBill(
            reservation.RoomType,
            reservation.NumberGuest,
            nights,
            reservation.Breakfast,
            reservation.Lunch,
            reservation.Dinner);
    }
}
