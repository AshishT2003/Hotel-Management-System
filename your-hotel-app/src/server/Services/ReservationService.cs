using HotelApp.Server.DTOs;
using HotelApp.Server.Models;
using HotelApp.Server.Repositories;

namespace HotelApp.Server.Services;

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

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _repo;
    private readonly IBillingService _billing;

    public ReservationService(IReservationRepository repo, IBillingService billing)
    {
        _repo = repo;
        _billing = billing;
    }

    public async Task<List<ReservationDto>> GetAllAsync(string? search = null, string? status = null, CancellationToken ct = default)
    {
        var list = await _repo.GetAllAsync(search, status, ct);
        return list.Select(MapToDto).ToList();
    }

    public async Task<ReservationDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var item = await _repo.GetByIdAsync(id, ct);
        return item == null ? null : MapToDto(item);
    }

    public async Task<ReservationDto> CreateAsync(CreateReservationDto dto, CancellationToken ct = default)
    {
        if (await _repo.IsRoomBookedAsync(dto.RoomNumber, dto.ArrivalTime, dto.LeavingTime, null, ct))
        {
            throw new InvalidOperationException($"Room {dto.RoomNumber} is already booked for the selected dates. Double booking prevented.");
        }

        var nights = Math.Max(1, (int)(dto.LeavingTime.Date - dto.ArrivalTime.Date).TotalDays);
        var floor = dto.RoomNumber.Length > 0 ? dto.RoomNumber.Substring(0, 1) : "1";

        var (roomSubtotal, guestSurcharge, foodBill, taxAmount, finalTotal) = 
            _billing.CalculateBill(dto.RoomType, dto.NumberGuest, nights, dto.Breakfast, dto.Lunch, dto.Dinner);

        var entity = new Reservation
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Birthday = dto.Birthday,
            Gender = dto.Gender,
            PhoneNumber = dto.PhoneNumber,
            EmailAddress = dto.EmailAddress,
            NumberGuest = dto.NumberGuest,
            StreetAddress = dto.StreetAddress,
            AptSuite = dto.AptSuite,
            City = dto.City,
            State = dto.State,
            ZipCode = dto.ZipCode,
            RoomType = dto.RoomType,
            RoomFloor = floor,
            RoomNumber = dto.RoomNumber,
            TotalBill = finalTotal,
            PaymentType = dto.PaymentType,
            CardType = dto.CardType,
            CardNumber = dto.CardNumber,
            CardExp = dto.CardExp,
            CardCvc = dto.CardCvc,
            ArrivalTime = dto.ArrivalTime,
            LeavingTime = dto.LeavingTime,
            CheckIn = dto.CheckIn,
            Breakfast = dto.Breakfast,
            Lunch = dto.Lunch,
            Dinner = dto.Dinner,
            Cleaning = dto.Cleaning,
            Towel = dto.Towel,
            Surprise = dto.Surprise,
            SupplyStatus = false,
            FoodBill = (int)foodBill
        };

        var created = await _repo.CreateAsync(entity, ct);
        return MapToDto(created);
    }

    public async Task<bool> UpdateAsync(int id, CreateReservationDto dto, CancellationToken ct = default)
    {
        var existing = await _repo.GetByIdAsync(id, ct);
        if (existing == null) return false;

        if (await _repo.IsRoomBookedAsync(dto.RoomNumber, dto.ArrivalTime, dto.LeavingTime, id, ct))
        {
            throw new InvalidOperationException($"Room {dto.RoomNumber} is already booked for the selected dates. Double booking prevented.");
        }

        var nights = Math.Max(1, (int)(dto.LeavingTime.Date - dto.ArrivalTime.Date).TotalDays);
        var floor = dto.RoomNumber.Length > 0 ? dto.RoomNumber.Substring(0, 1) : "1";

        var (roomSubtotal, guestSurcharge, foodBill, taxAmount, finalTotal) = 
            _billing.CalculateBill(dto.RoomType, dto.NumberGuest, nights, dto.Breakfast, dto.Lunch, dto.Dinner);

        existing.FirstName = dto.FirstName;
        existing.LastName = dto.LastName;
        existing.Birthday = dto.Birthday;
        existing.Gender = dto.Gender;
        existing.PhoneNumber = dto.PhoneNumber;
        existing.EmailAddress = dto.EmailAddress;
        existing.NumberGuest = dto.NumberGuest;
        existing.StreetAddress = dto.StreetAddress;
        existing.AptSuite = dto.AptSuite;
        existing.City = dto.City;
        existing.State = dto.State;
        existing.ZipCode = dto.ZipCode;
        existing.RoomType = dto.RoomType;
        existing.RoomFloor = floor;
        existing.RoomNumber = dto.RoomNumber;
        existing.TotalBill = finalTotal;
        existing.PaymentType = dto.PaymentType;
        existing.CardType = dto.CardType;
        existing.CardNumber = dto.CardNumber;
        existing.CardExp = dto.CardExp;
        existing.CardCvc = dto.CardCvc;
        existing.ArrivalTime = dto.ArrivalTime;
        existing.LeavingTime = dto.LeavingTime;
        existing.CheckIn = dto.CheckIn;
        existing.Breakfast = dto.Breakfast;
        existing.Lunch = dto.Lunch;
        existing.Dinner = dto.Dinner;
        existing.Cleaning = dto.Cleaning;
        existing.Towel = dto.Towel;
        existing.Surprise = dto.Surprise;
        existing.FoodBill = (int)foodBill;

        return await _repo.UpdateAsync(existing, ct);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default) =>
        await _repo.DeleteAsync(id, ct);

    public async Task<bool> ToggleCheckInAsync(int id, bool checkIn, CancellationToken ct = default) =>
        await _repo.UpdateCheckInAsync(id, checkIn, ct);

    public async Task<InvoiceDto?> GetInvoiceAsync(int id, CancellationToken ct = default)
    {
        var r = await _repo.GetByIdAsync(id, ct);
        if (r == null) return null;

        var nights = Math.Max(1, (int)(r.LeavingTime.Date - r.ArrivalTime.Date).TotalDays);
        var (roomSubtotal, guestSurcharge, foodBill, taxAmount, finalTotal) = 
            _billing.CalculateBill(r.RoomType, r.NumberGuest, nights, r.Breakfast, r.Lunch, r.Dinner);

        var cardLast4 = r.CardNumber.Length >= 4 ? r.CardNumber.Substring(r.CardNumber.Length - 4) : "••••";

        return new InvoiceDto
        {
            ReservationId = r.Id,
            GuestName = $"{r.FirstName} {r.LastName}",
            RoomNumber = r.RoomNumber,
            RoomType = r.RoomType,
            Nights = nights,
            BaseRate = roomSubtotal / nights,
            RoomSubtotal = roomSubtotal,
            GuestSurcharge = guestSurcharge,
            BreakfastTotal = r.Breakfast * 7.0,
            LunchTotal = r.Lunch * 12.0,
            DinnerTotal = r.Dinner * 15.0,
            FoodTotal = foodBill,
            TaxAmount = taxAmount,
            FinalTotal = finalTotal,
            PaymentType = r.PaymentType,
            CardLast4 = cardLast4
        };
    }

    private static ReservationDto MapToDto(Reservation r) => new()
    {
        Id = r.Id,
        FirstName = r.FirstName,
        LastName = r.LastName,
        Birthday = r.Birthday,
        Gender = r.Gender,
        PhoneNumber = r.PhoneNumber,
        EmailAddress = r.EmailAddress,
        NumberGuest = r.NumberGuest,
        StreetAddress = r.StreetAddress,
        AptSuite = r.AptSuite,
        City = r.City,
        State = r.State,
        ZipCode = r.ZipCode,
        RoomType = r.RoomType,
        RoomFloor = r.RoomFloor,
        RoomNumber = r.RoomNumber,
        TotalBill = r.TotalBill,
        PaymentType = r.PaymentType,
        CardType = r.CardType,
        CardNumber = r.CardNumber,
        CardExp = r.CardExp,
        CardCvc = r.CardCvc,
        ArrivalTime = r.ArrivalTime.ToString("yyyy-MM-dd"),
        LeavingTime = r.LeavingTime.ToString("yyyy-MM-dd"),
        CheckIn = r.CheckIn,
        Breakfast = r.Breakfast,
        Lunch = r.Lunch,
        Dinner = r.Dinner,
        Cleaning = r.Cleaning,
        Towel = r.Towel,
        Surprise = r.Surprise,
        SupplyStatus = r.SupplyStatus,
        FoodBill = r.FoodBill
    };
}
