using System.Data;
using Microsoft.Data.SqlClient;
using HotelApp.Domain.Entities;
using HotelApp.Domain.Interfaces;
using Microsoft.Extensions.Configuration;

namespace HotelApp.Infrastructure.Repositories;

public class ReservationRepository : IReservationRepository
{
    private readonly string _connectionString;
    private static readonly List<Reservation> MemoryStore = new();
    private static int _nextId = 1018;

    public ReservationRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection") 
            ?? @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=|DataDirectory|\frontend_reservation.mdf;Integrated Security=True;Connect Timeout=15";
    }

    public async Task<List<Reservation>> GetAllAsync(string? search = null, string? status = null, CancellationToken ct = default)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync(ct);
            var query = "SELECT Id, first_name, last_name, birth_day, gender, phone_number, email_address, number_guest, street_address, apt_suite, city, state, zip_code, room_type, room_floor, room_number, total_bill, payment_type, card_type, card_number, card_exp, card_cvc, arrival_time, leaving_time, check_in, break_fast, lunch, dinner, cleaning, towel, s_surprise, supply_status, food_bill FROM reservation ORDER BY Id DESC";
            
            using var cmd = new SqlCommand(query, conn);
            using var reader = await cmd.ExecuteReaderAsync(ct);
            var results = new List<Reservation>();

            while (await reader.ReadAsync(ct))
            {
                results.Add(MapFromReader(reader));
            }

            return FilterReservations(results, search, status);
        }
        catch
        {
            lock (MemoryStore)
            {
                EnsureSeededMemoryStore();
                return FilterReservations(MemoryStore.ToList(), search, status);
            }
        }
    }

    public async Task<Reservation?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync(ct);
            var query = "SELECT TOP 1 * FROM reservation WHERE Id = @Id";
            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@Id", id);

            using var reader = await cmd.ExecuteReaderAsync(ct);
            if (await reader.ReadAsync(ct))
            {
                return MapFromReader(reader);
            }
            return null;
        }
        catch
        {
            lock (MemoryStore)
            {
                EnsureSeededMemoryStore();
                return MemoryStore.FirstOrDefault(r => r.Id == id);
            }
        }
    }

    public async Task<Reservation> CreateAsync(Reservation r, CancellationToken ct = default)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync(ct);
            var query = @"
                INSERT INTO reservation (
                    first_name, last_name, birth_day, gender, phone_number, email_address,
                    number_guest, street_address, apt_suite, city, state, zip_code,
                    room_type, room_floor, room_number, total_bill, payment_type, card_type,
                    card_number, card_exp, card_cvc, arrival_time, leaving_time, check_in,
                    break_fast, lunch, dinner, cleaning, towel, s_surprise, supply_status, food_bill
                ) VALUES (
                    @first_name, @last_name, @birth_day, @gender, @phone_number, @email_address,
                    @number_guest, @street_address, @apt_suite, @city, @state, @zip_code,
                    @room_type, @room_floor, @room_number, @total_bill, @payment_type, @card_type,
                    @card_number, @card_exp, @card_cvc, @arrival_time, @leaving_time, @check_in,
                    @break_fast, @lunch, @dinner, @cleaning, @towel, @s_surprise, @supply_status, @food_bill
                );
                SELECT CAST(SCOPE_IDENTITY() AS int);";

            using var cmd = new SqlCommand(query, conn);
            AddParameters(cmd, r);
            r.Id = Convert.ToInt32(await cmd.ExecuteScalarAsync(ct));
            return r;
        }
        catch
        {
            lock (MemoryStore)
            {
                EnsureSeededMemoryStore();
                r.Id = _nextId++;
                MemoryStore.Insert(0, r);
                return r;
            }
        }
    }

    public async Task<bool> UpdateAsync(Reservation r, CancellationToken ct = default)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync(ct);
            var query = @"
                UPDATE reservation SET
                    first_name = @first_name, last_name = @last_name, birth_day = @birth_day,
                    gender = @gender, phone_number = @phone_number, email_address = @email_address,
                    number_guest = @number_guest, street_address = @street_address, apt_suite = @apt_suite,
                    city = @city, state = @state, zip_code = @zip_code, room_type = @room_type,
                    room_floor = @room_floor, room_number = @room_number, total_bill = @total_bill,
                    payment_type = @payment_type, card_type = @card_type, card_number = @card_number,
                    card_exp = @card_exp, card_cvc = @card_cvc, arrival_time = @arrival_time,
                    leaving_time = @leaving_time, check_in = @check_in, break_fast = @break_fast,
                    lunch = @lunch, dinner = @dinner, cleaning = @cleaning, towel = @towel,
                    s_surprise = @s_surprise, supply_status = @supply_status, food_bill = @food_bill
                WHERE Id = @Id";

            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@Id", r.Id);
            AddParameters(cmd, r);
            return await cmd.ExecuteNonQueryAsync(ct) > 0;
        }
        catch
        {
            lock (MemoryStore)
            {
                var idx = MemoryStore.FindIndex(x => x.Id == r.Id);
                if (idx != -1)
                {
                    MemoryStore[idx] = r;
                    return true;
                }
                return false;
            }
        }
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync(ct);
            var query = "DELETE FROM reservation WHERE Id = @Id";
            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@Id", id);
            return await cmd.ExecuteNonQueryAsync(ct) > 0;
        }
        catch
        {
            lock (MemoryStore)
            {
                return MemoryStore.RemoveAll(x => x.Id == id) > 0;
            }
        }
    }

    public async Task<bool> UpdateCheckInAsync(int id, bool checkIn, CancellationToken ct = default)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync(ct);
            var query = "UPDATE reservation SET check_in = @check_in WHERE Id = @Id";
            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.Parameters.AddWithValue("@check_in", checkIn ? 1 : 0);
            return await cmd.ExecuteNonQueryAsync(ct) > 0;
        }
        catch
        {
            lock (MemoryStore)
            {
                var item = MemoryStore.FirstOrDefault(x => x.Id == id);
                if (item != null)
                {
                    item.CheckIn = checkIn;
                    return true;
                }
                return false;
            }
        }
    }

    public async Task<bool> UpdateSupplyStatusAsync(int id, bool supplyStatus, CancellationToken ct = default)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync(ct);
            var query = "UPDATE reservation SET supply_status = @supply_status WHERE Id = @Id";
            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@Id", id);
            cmd.Parameters.AddWithValue("@supply_status", supplyStatus ? 1 : 0);
            return await cmd.ExecuteNonQueryAsync(ct) > 0;
        }
        catch
        {
            lock (MemoryStore)
            {
                var item = MemoryStore.FirstOrDefault(x => x.Id == id);
                if (item != null)
                {
                    item.SupplyStatus = supplyStatus;
                    return true;
                }
                return false;
            }
        }
    }

    public async Task<bool> IsRoomBookedAsync(string roomNumber, DateTime arrival, DateTime leaving, int? excludeId = null, CancellationToken ct = default)
    {
        var all = await GetAllAsync(null, null, ct);
        var trimmed = roomNumber.Trim();
        return all.Any(r => 
            (excludeId == null || r.Id != excludeId.Value) &&
            r.RoomNumber.Trim().Equals(trimmed, StringComparison.OrdinalIgnoreCase) &&
            r.ArrivalTime < leaving && arrival < r.LeavingTime
        );
    }

    private static Reservation MapFromReader(SqlDataReader reader) => new()
    {
        Id = reader.GetInt32(reader.GetOrdinal("Id")),
        FirstName = reader["first_name"]?.ToString()?.Trim() ?? "",
        LastName = reader["last_name"]?.ToString()?.Trim() ?? "",
        Birthday = reader["birth_day"]?.ToString()?.Trim() ?? "",
        Gender = reader["gender"]?.ToString()?.Trim() ?? "",
        PhoneNumber = reader["phone_number"]?.ToString()?.Trim() ?? "",
        EmailAddress = reader["email_address"]?.ToString()?.Trim() ?? "",
        NumberGuest = Convert.ToInt32(reader["number_guest"]),
        StreetAddress = reader["street_address"]?.ToString()?.Trim() ?? "",
        AptSuite = reader["apt_suite"]?.ToString()?.Trim() ?? "",
        City = reader["city"]?.ToString()?.Trim() ?? "",
        State = reader["state"]?.ToString()?.Trim() ?? "",
        ZipCode = reader["zip_code"]?.ToString()?.Trim() ?? "",
        RoomType = reader["room_type"]?.ToString()?.Trim() ?? "",
        RoomFloor = reader["room_floor"]?.ToString()?.Trim() ?? "",
        RoomNumber = reader["room_number"]?.ToString()?.Trim() ?? "",
        TotalBill = Convert.ToDouble(reader["total_bill"]),
        PaymentType = reader["payment_type"]?.ToString()?.Trim() ?? "",
        CardType = reader["card_type"]?.ToString()?.Trim() ?? "",
        CardNumber = reader["card_number"]?.ToString()?.Trim() ?? "",
        CardExp = reader["card_exp"]?.ToString()?.Trim() ?? "",
        CardCvc = reader["card_cvc"]?.ToString()?.Trim() ?? "",
        ArrivalTime = Convert.ToDateTime(reader["arrival_time"]),
        LeavingTime = Convert.ToDateTime(reader["leaving_time"]),
        CheckIn = Convert.ToBoolean(reader["check_in"]),
        Breakfast = Convert.ToInt32(reader["break_fast"]),
        Lunch = Convert.ToInt32(reader["lunch"]),
        Dinner = Convert.ToInt32(reader["dinner"]),
        Cleaning = Convert.ToBoolean(reader["cleaning"]),
        Towel = Convert.ToBoolean(reader["towel"]),
        Surprise = Convert.ToBoolean(reader["s_surprise"]),
        SupplyStatus = Convert.ToBoolean(reader["supply_status"]),
        FoodBill = Convert.ToInt32(reader["food_bill"])
    };

    private static void AddParameters(SqlCommand cmd, Reservation r)
    {
        cmd.Parameters.AddWithValue("@first_name", r.FirstName);
        cmd.Parameters.AddWithValue("@last_name", r.LastName);
        cmd.Parameters.AddWithValue("@birth_day", r.Birthday);
        cmd.Parameters.AddWithValue("@gender", r.Gender);
        cmd.Parameters.AddWithValue("@phone_number", r.PhoneNumber);
        cmd.Parameters.AddWithValue("@email_address", r.EmailAddress);
        cmd.Parameters.AddWithValue("@number_guest", r.NumberGuest);
        cmd.Parameters.AddWithValue("@street_address", r.StreetAddress);
        cmd.Parameters.AddWithValue("@apt_suite", r.AptSuite);
        cmd.Parameters.AddWithValue("@city", r.City);
        cmd.Parameters.AddWithValue("@state", r.State);
        cmd.Parameters.AddWithValue("@zip_code", r.ZipCode);
        cmd.Parameters.AddWithValue("@room_type", r.RoomType);
        cmd.Parameters.AddWithValue("@room_floor", r.RoomFloor);
        cmd.Parameters.AddWithValue("@room_number", r.RoomNumber);
        cmd.Parameters.AddWithValue("@total_bill", r.TotalBill);
        cmd.Parameters.AddWithValue("@payment_type", r.PaymentType);
        cmd.Parameters.AddWithValue("@card_type", r.CardType);
        cmd.Parameters.AddWithValue("@card_number", r.CardNumber);
        cmd.Parameters.AddWithValue("@card_exp", r.CardExp);
        cmd.Parameters.AddWithValue("@card_cvc", r.CardCvc);
        cmd.Parameters.AddWithValue("@arrival_time", r.ArrivalTime);
        cmd.Parameters.AddWithValue("@leaving_time", r.LeavingTime);
        cmd.Parameters.AddWithValue("@check_in", r.CheckIn ? 1 : 0);
        cmd.Parameters.AddWithValue("@break_fast", r.Breakfast);
        cmd.Parameters.AddWithValue("@lunch", r.Lunch);
        cmd.Parameters.AddWithValue("@dinner", r.Dinner);
        cmd.Parameters.AddWithValue("@cleaning", r.Cleaning ? 1 : 0);
        cmd.Parameters.AddWithValue("@towel", r.Towel ? 1 : 0);
        cmd.Parameters.AddWithValue("@s_surprise", r.Surprise ? 1 : 0);
        cmd.Parameters.AddWithValue("@supply_status", r.SupplyStatus ? 1 : 0);
        cmd.Parameters.AddWithValue("@food_bill", r.FoodBill);
    }

    private static List<Reservation> FilterReservations(List<Reservation> list, string? search, string? status)
    {
        var result = list.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            if (status.Equals("CHECKED_IN", StringComparison.OrdinalIgnoreCase))
                result = result.Where(r => r.CheckIn);
            else if (status.Equals("RESERVED", StringComparison.OrdinalIgnoreCase))
                result = result.Where(r => !r.CheckIn);
            else if (status.Equals("WITH_DINING", StringComparison.OrdinalIgnoreCase))
                result = result.Where(r => r.Breakfast > 0 || r.Lunch > 0 || r.Dinner > 0);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            result = result.Where(r =>
                r.Id.ToString().Contains(term) ||
                $"{r.FirstName} {r.LastName}".ToLowerInvariant().Contains(term) ||
                r.RoomNumber.ToLowerInvariant().Contains(term) ||
                r.PhoneNumber.ToLowerInvariant().Contains(term) ||
                r.EmailAddress.ToLowerInvariant().Contains(term) ||
                r.City.ToLowerInvariant().Contains(term) ||
                r.State.ToLowerInvariant().Contains(term)
            );
        }

        return result.ToList();
    }

    private static void EnsureSeededMemoryStore()
    {
        if (MemoryStore.Count == 0)
        {
            MemoryStore.AddRange(new[]
            {
                new Reservation { Id = 1011, FirstName = "Nazim", LastName = "Amin", RoomNumber = "205", RoomType = "Double", RoomFloor = "2", TotalBill = 378.93, CheckIn = true, Breakfast = 2, Lunch = 1, Dinner = 2, Cleaning = true, Towel = true, Surprise = true, PhoneNumber = "(999) 999-9999", EmailAddress = "nazim@hotel.com" },
                new Reservation { Id = 1013, FirstName = "Ceaser", LastName = "Krit", RoomNumber = "101", RoomType = "Single", RoomFloor = "1", TotalBill = 173.43, CheckIn = false, Breakfast = 2, Towel = true, PhoneNumber = "(555) 234-5678", EmailAddress = "ceaser.krit@example.com" },
                new Reservation { Id = 1014, FirstName = "George", LastName = "Zhang", RoomNumber = "103", RoomType = "Single", RoomFloor = "1", TotalBill = 169.43, CheckIn = true, Cleaning = true, PhoneNumber = "(415) 888-9999", EmailAddress = "george.z@siliconvalley.io" },
                new Reservation { Id = 1015, FirstName = "Sophia", LastName = "Loren", RoomNumber = "402", RoomType = "Duplex", RoomFloor = "4", TotalBill = 456.93, CheckIn = true, Breakfast = 2, Cleaning = true, Towel = true, Surprise = true, PhoneNumber = "(212) 555-0199", EmailAddress = "sophia.loren@luxury.com" },
                new Reservation { Id = 1016, FirstName = "Alexander", LastName = "Vance", RoomNumber = "501", RoomType = "Suite", RoomFloor = "5", TotalBill = 563.93, CheckIn = false, Breakfast = 2, Lunch = 1, Towel = true, Surprise = true, PhoneNumber = "(312) 555-8821", EmailAddress = "avance@globalholdings.com" }
            });
        }
    }
}
