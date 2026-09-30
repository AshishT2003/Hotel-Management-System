using HotelApp.Server.Models;
using HotelApp.Server.Services;
using Xunit;

namespace HotelApp.Tests.Server;

public class BillingServiceTests
{
    private readonly IBillingService _billingService;

    public BillingServiceTests()
    {
        _billingService = new BillingService();
    }

    [Theory]
    [InlineData("Single", 149.0)]
    [InlineData("Double", 299.0)]
    [InlineData("Twin", 349.0)]
    [InlineData("Duplex", 399.0)]
    [InlineData("Suite", 499.0)]
    public void CalculateBill_BaseRateForSingleNight_ShouldMatchExpected(string roomType, decimal expectedRate)
    {
        // Arrange
        var reservation = new Reservation
        {
            RoomType = roomType,
            NumberGuest = 1,
            ArrivalTime = new DateTime(2026, 10, 1),
            LeavingTime = new DateTime(2026, 10, 2),
            Breakfast = 0,
            Lunch = 0,
            Dinner = 0
        };

        // Act
        var result = _billingService.CalculateBill(reservation);

        // Assert
        Assert.Equal((double)expectedRate, result.RoomSubtotal, 2);
        Assert.Equal(0, result.GuestSurcharge);
        Assert.Equal(0, result.FoodBill);
        var expectedTax = Math.Round((double)expectedRate * 0.07, 2);
        Assert.Equal(expectedTax, result.TaxAmount, 2);
        Assert.Equal((double)expectedRate + expectedTax, result.FinalTotal, 2);
    }

    [Fact]
    public void CalculateBill_TC04_SuiteTwoNightsThreeGuestsWithMeals_ShouldMatchFormulaToThePenny()
    {
        // TC-04: Book Suite for 2 nights with 3 guests, 2 breakfasts, 1 dinner.
        // Base: $499 * 2 = $998.
        // Extra: (3 - 2) * $25 = $25.
        // Meals: (2 * 7) + 15 = $29.
        // Taxable Subtotal = 998 + 25 + 29 = $1052.
        // Tax: 7% * 1052 = $73.64.
        // Total: $1,125.64.
        var reservation = new Reservation
        {
            RoomType = "Suite",
            NumberGuest = 3,
            ArrivalTime = new DateTime(2026, 10, 1),
            LeavingTime = new DateTime(2026, 10, 3), // 2 nights
            Breakfast = 2,
            Lunch = 0,
            Dinner = 1
        };

        var result = _billingService.CalculateBill(reservation);

        Assert.Equal(998.0, result.RoomSubtotal, 2);
        Assert.Equal(25.0, result.GuestSurcharge, 2);
        Assert.Equal(29.0, result.FoodBill, 2);
        Assert.Equal(73.64, result.TaxAmount, 2);
        Assert.Equal(1125.64, result.FinalTotal, 2);
    }

    [Fact]
    public void CalculateBill_ClampsZeroOrNegativeNights_ToAtLeastOneNight()
    {
        var reservation = new Reservation
        {
            RoomType = "Single",
            NumberGuest = 1,
            ArrivalTime = new DateTime(2026, 10, 1),
            LeavingTime = new DateTime(2026, 10, 1), // 0 days diff
            Breakfast = 0,
            Lunch = 0,
            Dinner = 0
        };

        var result = _billingService.CalculateBill(reservation);

        Assert.Equal(149.0, result.RoomSubtotal);
        Assert.Equal(10.43, result.TaxAmount, 2);
        Assert.Equal(159.43, result.FinalTotal, 2);
    }

    [Fact]
    public void CalculateBill_FoodPortionPricing_CalculatesAccurately()
    {
        var reservation = new Reservation
        {
            RoomType = "Double",
            NumberGuest = 2,
            ArrivalTime = new DateTime(2026, 10, 1),
            LeavingTime = new DateTime(2026, 10, 2),
            Breakfast = 3, // 3 * 7 = 21
            Lunch = 2,     // 2 * 12 = 24
            Dinner = 1     // 1 * 15 = 15
        };

        var result = _billingService.CalculateBill(reservation);

        Assert.Equal(60.0, result.FoodBill); // 21 + 24 + 15 = 60
        Assert.Equal(299.0, result.RoomSubtotal);
        Assert.Equal(0, result.GuestSurcharge);
        Assert.Equal(359.0 * 0.07, result.TaxAmount, 2);
        Assert.Equal(Math.Round(359.0 * 1.07, 2), result.FinalTotal, 2);
    }
}
