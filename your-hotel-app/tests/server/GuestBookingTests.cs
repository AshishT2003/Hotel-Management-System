using HotelApp.Server.Controllers;
using HotelApp.Server.DTOs;
using HotelApp.Server.Models;
using HotelApp.Server.Repositories;
using HotelApp.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace HotelApp.Tests.Server;

public class GuestBookingTests
{
    private readonly Mock<IReservationRepository> _reservationRepoMock;
    private readonly Mock<IBillingService> _billingServiceMock;
    private readonly GuestBookingService _guestService;

    public GuestBookingTests()
    {
        _reservationRepoMock = new Mock<IReservationRepository>();
        _billingServiceMock = new Mock<IBillingService>();
        _guestService = new GuestBookingService(_reservationRepoMock.Object, _billingServiceMock.Object);
    }

    [Fact]
    public async Task GetAvailableRooms_ReturnsAvailableRooms_AndFiltersOutOverlapping()
    {
        // Arrange
        var checkIn = DateTime.UtcNow.AddDays(5);
        var checkOut = DateTime.UtcNow.AddDays(7);

        var existingReservations = new List<Reservation>
        {
            new Reservation
            {
                Id = 1,
                RoomNumber = "101",
                ArrivalTime = checkIn.AddDays(-1),
                LeavingTime = checkIn.AddDays(2),
                Status = "Reserved"
            }
        };

        _reservationRepoMock
            .Setup(r => r.GetAllAsync(null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingReservations);

        // Act
        var result = await _guestService.GetAvailableRoomsAsync(checkIn, checkOut, 1);

        // Assert
        Assert.NotEmpty(result);
        var room101 = result.FirstOrDefault(r => r.RoomNumber == "101");
        Assert.NotNull(room101);
        Assert.False(room101.Available);

        var room102 = result.FirstOrDefault(r => r.RoomNumber == "102");
        Assert.NotNull(room102);
        Assert.True(room102.Available);
    }

    [Fact]
    public async Task CreateGuestBooking_ValidRequest_CalculatesTaxAndSurchargeCorrectly()
    {
        // Arrange: Room 201 (Double: $299/night), 2 nights, 3 guests (1 extra = $25/night * 2 = $50),
        // 2 breakfasts ($14), 1 sweet surprise ($25)
        // Subtotal = (299 * 2) + 50 + 14 + 25 = 598 + 50 + 14 + 25 = 687
        // Tax = Round(687 * 0.07, 2) = 48.09
        // Total = 735.09
        var checkIn = DateTime.UtcNow.AddDays(10);
        var checkOut = DateTime.UtcNow.AddDays(12);

        var request = new GuestBookingRequestDto
        {
            RoomNumber = "201",
            CheckIn = checkIn,
            CheckOut = checkOut,
            Guests = new GuestPartyDto { Adults = 2, Children = 1 },
            GuestInfo = new GuestContactInfoDto
            {
                FirstName = "Eleanor",
                LastName = "Vance",
                Email = "eleanor.vance@example.com",
                Phone = "+15550192834",
                SpecialRequests = "High floor"
            },
            DiningPerks = new List<GuestMealItemDto>
            {
                new GuestMealItemDto { Type = "Breakfast", Quantity = 2 }
            },
            Amenities = new List<string> { "Sweet Surprise Pack" }
        };

        _reservationRepoMock
            .Setup(r => r.IsRoomBookedAsync("201", checkIn.Date, checkOut.Date, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _reservationRepoMock
            .Setup(r => r.CreateAsync(It.IsAny<Reservation>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Reservation res, CancellationToken _) =>
            {
                res.Id = 777;
                return res;
            });

        _reservationRepoMock
            .Setup(r => r.UpdateAsync(It.IsAny<Reservation>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var response = await _guestService.CreateGuestBookingAsync(request);

        // Assert
        Assert.NotNull(response);
        Assert.Equal(777, response.ReservationId);
        Assert.Equal($"GH-777-{DateTime.UtcNow.Year}", response.ConfirmationCode);
        Assert.Equal(598.0m, response.Breakdown.RoomTotal);
        Assert.Equal(50.0m, response.Breakdown.ExtraGuestSurcharge);
        Assert.Equal(14.0m, response.Breakdown.DiningTotal);
        Assert.Equal(25.0m, response.Breakdown.AmenitiesTotal);
        Assert.Equal(687.0m, response.Breakdown.Subtotal);
        Assert.Equal(48.09m, response.Breakdown.Tax);
        Assert.Equal(735.09m, response.Breakdown.Total);
    }

    [Fact]
    public async Task CreateGuestBooking_WhenRoomAlreadyBooked_ThrowsInvalidOperationException()
    {
        // Arrange
        var request = new GuestBookingRequestDto
        {
            RoomNumber = "301",
            CheckIn = DateTime.UtcNow.AddDays(2),
            CheckOut = DateTime.UtcNow.AddDays(4),
            GuestInfo = new GuestContactInfoDto
            {
                FirstName = "David",
                LastName = "Miller",
                Email = "david@example.com",
                Phone = "555-1234"
            }
        };

        _reservationRepoMock
            .Setup(r => r.IsRoomBookedAsync("301", It.IsAny<DateTime>(), It.IsAny<DateTime>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _guestService.CreateGuestBookingAsync(request));
    }

    [Fact]
    public async Task GetGuestBookingsByEmail_FiltersMatchingRecords()
    {
        // Arrange
        var list = new List<Reservation>
        {
            new Reservation
            {
                Id = 10,
                EmailAddress = "guest@example.com",
                RoomNumber = "401",
                RoomType = "Duplex",
                ArrivalTime = DateTime.UtcNow.AddDays(5),
                LeavingTime = DateTime.UtcNow.AddDays(7),
                Status = "Reserved",
                TotalBill = 850.00
            },
            new Reservation
            {
                Id = 11,
                EmailAddress = "other@example.com",
                RoomNumber = "102",
                ArrivalTime = DateTime.UtcNow.AddDays(1),
                LeavingTime = DateTime.UtcNow.AddDays(2),
                Status = "Reserved"
            }
        };

        _reservationRepoMock
            .Setup(r => r.GetAllAsync(null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(list);

        // Act
        var result = await _guestService.GetGuestBookingsByEmailAsync("guest@example.com");

        // Assert
        Assert.Single(result);
        Assert.Equal("401", result[0].RoomNumber);
        Assert.True(result[0].CanCancel);
    }

    [Fact]
    public async Task CancelGuestBooking_Inside48HourWindow_ThrowsInvalidOperationException()
    {
        // Arrange: CheckIn is in 24 hours (less than 48 hours)
        var reservation = new Reservation
        {
            Id = 42,
            EmailAddress = "guest@example.com",
            ArrivalTime = DateTime.UtcNow.AddHours(24),
            LeavingTime = DateTime.UtcNow.AddDays(3),
            Status = "Reserved"
        };

        _reservationRepoMock
            .Setup(r => r.GetByIdAsync(42, It.IsAny<CancellationToken>()))
            .ReturnsAsync(reservation);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => 
            _guestService.CancelGuestBookingAsync(42, "guest@example.com"));
    }

    [Fact]
    public async Task CancelGuestBooking_Outside48HourWindow_CancelsSuccessfully()
    {
        // Arrange: CheckIn is in 72 hours (more than 48 hours)
        var reservation = new Reservation
        {
            Id = 55,
            EmailAddress = "guest@example.com",
            ArrivalTime = DateTime.UtcNow.AddHours(72),
            LeavingTime = DateTime.UtcNow.AddDays(5),
            Status = "Reserved"
        };

        _reservationRepoMock
            .Setup(r => r.GetByIdAsync(55, It.IsAny<CancellationToken>()))
            .ReturnsAsync(reservation);

        _reservationRepoMock
            .Setup(r => r.UpdateAsync(It.IsAny<Reservation>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _guestService.CancelGuestBookingAsync(55, "guest@example.com");

        // Assert
        Assert.True(result);
        Assert.Equal("Cancelled", reservation.Status);
    }
}
