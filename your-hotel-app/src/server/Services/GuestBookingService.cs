using HotelApp.Server.DTOs;
using HotelApp.Server.Models;
using HotelApp.Server.Repositories;

namespace HotelApp.Server.Services;

public interface IGuestBookingService
{
    Task<List<AvailableRoomDto>> GetAvailableRoomsAsync(DateTime checkIn, DateTime checkOut, int guests, CancellationToken ct = default);
    Task<GuestBookingResponseDto> CreateGuestBookingAsync(GuestBookingRequestDto request, CancellationToken ct = default);
    Task<List<GuestBookingSummaryDto>> GetGuestBookingsByEmailAsync(string email, CancellationToken ct = default);
    Task<bool> CancelGuestBookingAsync(int id, string email, CancellationToken ct = default);
}

public class GuestBookingService : IGuestBookingService
{
    private readonly IReservationRepository _reservationRepo;
    private readonly IBillingService _billingService;

    private static readonly (int Floor, string Type, decimal Rate, int Capacity, string[] Amenities, string[] Rooms)[] InventoryConfig = new[]
    {
        (1, "Single", 149.0m, 1, new[] { "High-Speed WiFi", "Air Conditioning", "HD Smart TV", "Work Desk" },
            new[] { "101", "102", "103", "104", "105", "106", "107", "108", "109", "110" }),
        (2, "Double", 299.0m, 2, new[] { "High-Speed WiFi", "Air Conditioning", "HD Smart TV", "Mini Bar", "Balcony View" },
            new[] { "201", "202", "203", "204", "205", "206", "207", "208", "209", "210" }),
        (3, "Twin", 349.0m, 2, new[] { "High-Speed WiFi", "Dual Queen Beds", "Air Conditioning", "Mini Fridge", "Espresso Maker" },
            new[] { "301", "302", "303", "304", "305", "306", "307", "308", "309", "310" }),
        (4, "Duplex", 399.0m, 4, new[] { "High-Speed WiFi", "Two-Level Loft", "Panoramic Skyline View", "Mini Bar", "Luxury Tub" },
            new[] { "401", "402", "403", "404", "405", "406", "407", "408", "409", "410" }),
        (5, "Suite", 499.0m, 6, new[] { "High-Speed WiFi", "Executive Living Room", "King Master Bed", "Jacuzzi", "Butler Service", "Complimentary Champagne" },
            new[] { "501", "502", "503", "504", "505", "506", "507", "508", "509", "510" }),
    };

    public GuestBookingService(IReservationRepository reservationRepo, IBillingService billingService)
    {
        _reservationRepo = reservationRepo;
        _billingService = billingService;
    }

    public async Task<List<AvailableRoomDto>> GetAvailableRoomsAsync(DateTime checkIn, DateTime checkOut, int guests, CancellationToken ct = default)
    {
        var normalizedCheckIn = checkIn.Date;
        var normalizedCheckOut = checkOut.Date <= checkIn.Date ? checkIn.Date.AddDays(1) : checkOut.Date;

        var allReservations = await _reservationRepo.GetAllAsync(null, null, ct);
        
        // Find occupied or reserved rooms in the given date range
        var overlappingBookings = allReservations
            .Where(r => r.Status != "Cancelled")
            .Where(r => !(r.LeavingTime.Date <= normalizedCheckIn || r.ArrivalTime.Date >= normalizedCheckOut))
            .Select(r => r.RoomNumber.Trim())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var availableRooms = new List<AvailableRoomDto>();

        foreach (var (floor, type, rate, capacity, amenities, rooms) in InventoryConfig)
        {
            var freeRoomsOfType = rooms.Where(r => !overlappingBookings.Contains(r)).ToList();

            foreach (var roomNum in rooms)
            {
                var isAvailable = !overlappingBookings.Contains(roomNum);
                if (guests > 0 && capacity < guests && capacity < 2) continue; // Skip single rooms if more guests than capacity

                availableRooms.Add(new AvailableRoomDto
                {
                    RoomId = int.Parse(roomNum),
                    RoomNumber = roomNum,
                    Type = type,
                    Floor = floor,
                    BaseRate = rate,
                    Capacity = capacity,
                    Amenities = amenities.ToList(),
                    Available = isAvailable,
                    UrgencyBadge = isAvailable && freeRoomsOfType.Count <= 2 ? $"Only {freeRoomsOfType.Count} rooms left!" : null
                });
            }
        }

        return availableRooms.OrderBy(r => r.Floor).ThenBy(r => r.RoomNumber).ToList();
    }

    public async Task<GuestBookingResponseDto> CreateGuestBookingAsync(GuestBookingRequestDto request, CancellationToken ct = default)
    {
        if (request.CheckIn.Date < DateTime.UtcNow.Date.AddDays(-1)) // Allow today
        {
            throw new ArgumentException("Check-in date cannot be in the past.");
        }

        var normalizedCheckIn = request.CheckIn.Date;
        var normalizedCheckOut = request.CheckOut.Date <= normalizedCheckIn 
            ? normalizedCheckIn.AddDays(1) 
            : request.CheckOut.Date;

        var nights = (int)Math.Max(1, (normalizedCheckOut - normalizedCheckIn).TotalDays);

        // 1. Verify Room Availability
        var isBooked = await _reservationRepo.IsRoomBookedAsync(request.RoomNumber, normalizedCheckIn, normalizedCheckOut, null, ct);
        if (isBooked)
        {
            throw new InvalidOperationException($"Room {request.RoomNumber} is not available for selected dates.");
        }

        // 2. Identify Room Configuration
        var roomConfig = InventoryConfig.FirstOrDefault(c => c.Rooms.Contains(request.RoomNumber.Trim()));
        var roomType = roomConfig.Type ?? "Single";
        var roomFloor = roomConfig.Floor.ToString();
        var baseRate = roomConfig.Rate > 0 ? roomConfig.Rate : 149.0m;

        // 3. Billing Calculation
        var roomTotal = baseRate * nights;

        var totalGuests = (request.Guests?.Adults ?? 1) + (request.Guests?.Children ?? 0);
        var extraGuests = Math.Max(0, totalGuests - 2);
        var extraGuestSurcharge = extraGuests * 25.0m * nights;

        var breakfastQty = request.DiningPerks?.FirstOrDefault(d => d.Type.Equals("Breakfast", StringComparison.OrdinalIgnoreCase))?.Quantity ?? 0;
        var lunchQty = request.DiningPerks?.FirstOrDefault(d => d.Type.Equals("Lunch", StringComparison.OrdinalIgnoreCase))?.Quantity ?? 0;
        var dinnerQty = request.DiningPerks?.FirstOrDefault(d => d.Type.Equals("Dinner", StringComparison.OrdinalIgnoreCase))?.Quantity ?? 0;

        var diningTotal = (breakfastQty * 7.0m) + (lunchQty * 12.0m) + (dinnerQty * 15.0m);

        var hasCleaning = request.Amenities?.Any(a => a.Contains("Cleaning", StringComparison.OrdinalIgnoreCase) || a.Contains("Housekeeping", StringComparison.OrdinalIgnoreCase)) ?? false;
        var hasTowel = request.Amenities?.Any(a => a.Contains("Towel", StringComparison.OrdinalIgnoreCase)) ?? false;
        var hasSurprise = request.Amenities?.Any(a => a.Contains("Surprise", StringComparison.OrdinalIgnoreCase)) ?? false;

        var amenitiesTotal = hasSurprise ? 25.0m : 0.0m;

        var subtotal = roomTotal + extraGuestSurcharge + diningTotal + amenitiesTotal;
        var tax = Math.Round(subtotal * 0.07m, 2);
        var totalAmount = subtotal + tax;

        // 4. Create and Persist Reservation
        var reservation = new Reservation
        {
            FirstName = request.GuestInfo.FirstName.Trim(),
            LastName = request.GuestInfo.LastName.Trim(),
            PhoneNumber = request.GuestInfo.Phone.Trim(),
            EmailAddress = request.GuestInfo.Email.Trim().ToLowerInvariant(),
            NumberGuest = totalGuests,
            RoomType = roomType,
            RoomFloor = roomFloor,
            RoomNumber = request.RoomNumber.Trim(),
            ArrivalTime = normalizedCheckIn,
            LeavingTime = normalizedCheckOut,
            CheckIn = false,
            Breakfast = breakfastQty,
            Lunch = lunchQty,
            Dinner = dinnerQty,
            Cleaning = hasCleaning,
            Towel = hasTowel,
            Surprise = hasSurprise,
            SupplyStatus = false,
            FoodBill = (int)diningTotal,
            TotalBill = (double)totalAmount,
            PaymentType = request.PaymentMethod ?? "PayAtHotel",
            BookingSource = "Guest Portal",
            PaymentStatus = "Pending",
            SpecialRequests = request.GuestInfo.SpecialRequests ?? string.Empty,
            Status = "Reserved",
            CancellationPolicy = "Free cancellation up to 48 hours before check-in"
        };

        var created = await _reservationRepo.CreateAsync(reservation, ct);
        var confirmationCode = $"GH-{created.Id}-{DateTime.UtcNow.Year}";
        created.ConfirmationCode = confirmationCode;
        await _reservationRepo.UpdateAsync(created, ct);

        // 5. Mock Email Notification
        Console.WriteLine($"[GUEST PORTAL EMAIL SERVICE] Booking confirmation sent to {created.EmailAddress} for confirmation code {confirmationCode}.");

        return new GuestBookingResponseDto
        {
            ReservationId = created.Id,
            ConfirmationCode = confirmationCode,
            Status = "Reserved",
            TotalAmount = totalAmount,
            Breakdown = new BillingBreakdownDto
            {
                RoomTotal = roomTotal,
                DiningTotal = diningTotal,
                ExtraGuestSurcharge = extraGuestSurcharge,
                AmenitiesTotal = amenitiesTotal,
                Subtotal = subtotal,
                Tax = tax,
                Total = totalAmount
            },
            BookingSource = "Guest Portal",
            PaymentStatus = "Pending",
            CancellationPolicy = created.CancellationPolicy
        };
    }

    public async Task<List<GuestBookingSummaryDto>> GetGuestBookingsByEmailAsync(string email, CancellationToken ct = default)
    {
        var cleanEmail = email.Trim().ToLowerInvariant();
        var all = await _reservationRepo.GetAllAsync(null, null, ct);

        return all
            .Where(r => r.EmailAddress.Equals(cleanEmail, StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(r => r.Id)
            .Select(r => new GuestBookingSummaryDto
            {
                ReservationId = r.Id,
                ConfirmationCode = string.IsNullOrWhiteSpace(r.ConfirmationCode) ? $"GH-{r.Id}-{r.ArrivalTime.Year}" : r.ConfirmationCode,
                RoomNumber = r.RoomNumber,
                RoomType = r.RoomType,
                CheckIn = r.ArrivalTime,
                CheckOut = r.LeavingTime,
                Status = string.IsNullOrWhiteSpace(r.Status) ? (r.CheckIn ? "In Room" : "Reserved") : r.Status,
                TotalAmount = (decimal)r.TotalBill,
                BookingSource = string.IsNullOrWhiteSpace(r.BookingSource) ? "Guest Portal" : r.BookingSource,
                CanCancel = r.ArrivalTime > DateTime.UtcNow.AddHours(48) && r.Status != "Cancelled"
            })
            .ToList();
    }

    public async Task<bool> CancelGuestBookingAsync(int id, string email, CancellationToken ct = default)
    {
        var reservation = await _reservationRepo.GetByIdAsync(id, ct);
        if (reservation == null) return false;

        var cleanEmail = email.Trim().ToLowerInvariant();
        if (!reservation.EmailAddress.Equals(cleanEmail, StringComparison.OrdinalIgnoreCase))
        {
            throw new UnauthorizedAccessException("Email does not match reservation record.");
        }

        if (reservation.ArrivalTime <= DateTime.UtcNow.AddHours(48))
        {
            throw new InvalidOperationException("Free cancellation window has passed (< 48 hours before check-in). Please contact the front desk.");
        }

        reservation.Status = "Cancelled";
        reservation.CheckIn = false;
        var updated = await _reservationRepo.UpdateAsync(reservation, ct);

        Console.WriteLine($"[GUEST PORTAL EMAIL SERVICE] Cancellation confirmation sent to {cleanEmail} for reservation #{id}.");
        return updated;
    }
}
