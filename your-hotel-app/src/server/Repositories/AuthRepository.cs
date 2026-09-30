using System.Data;
using Microsoft.Data.SqlClient;
using HotelApp.Server.Models;

namespace HotelApp.Server.Repositories;

public interface IAuthRepository
{
    Task<User?> GetUserAsync(string username, string password, CancellationToken ct = default);
}

public class AuthRepository : IAuthRepository
{
    private readonly string _connectionString;
    private static readonly List<User> DefaultUsers = new()
    {
        new User { Username = "admin", Password = "adminPassword123", Role = "Admin", FullName = "Eleanor Vance (Front Desk)", Email = "admin@grandhorizon.com" },
        new User { Username = "kitchen", Password = "kitchenPassword123", Role = "Kitchen", FullName = "Marco Silva (Executive Chef)", Email = "kitchen@grandhorizon.com" },
        new User { Username = "manager", Password = "managerPassword123", Role = "Manager", FullName = "Arthur Pendelton (General Manager)", Email = "manager@grandhorizon.com" }
    };

    public AuthRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("LoginConnection") 
            ?? @"Data Source=(LocalDB)\MSSQLLocalDB;AttachDbFilename=|DataDirectory|\login_manager.mdf;Integrated Security=True;Connect Timeout=15";
    }

    public async Task<User?> GetUserAsync(string username, string password, CancellationToken ct = default)
    {
        var cleanUser = username.Trim().ToLowerInvariant();
        var cleanPass = password.Trim();

        // 1. Check default credentials
        var fallback = DefaultUsers.FirstOrDefault(u => 
            (u.Username.Equals(cleanUser, StringComparison.OrdinalIgnoreCase) && 
             (u.Password.Equals(cleanPass) || cleanPass.Equals(u.Username))) // also accepts demo username as password
        );
        if (fallback != null) return fallback;

        // 2. Query SQL Server LocalDB
        try
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync(ct);

            // Check frontend table
            var query = "SELECT user_name, pass_word FROM frontend WHERE user_name = @u AND pass_word = @p";
            using (var cmd = new SqlCommand(query, conn))
            {
                cmd.Parameters.AddWithValue("@u", username);
                cmd.Parameters.AddWithValue("@p", password);
                using var r = await cmd.ExecuteReaderAsync(ct);
                if (await r.ReadAsync(ct))
                {
                    var isMgr = username.Contains("manager", StringComparison.OrdinalIgnoreCase);
                    return new User
                    {
                        Username = username,
                        Role = isMgr ? "Manager" : "Admin",
                        FullName = isMgr ? "General Manager" : "Front Desk Admin",
                        Email = $"{username}@grandhorizon.com"
                    };
                }
            }

            // Check kitchen table
            var kitchenQuery = "SELECT user_name, pass_word FROM kitchen WHERE user_name = @u AND pass_word = @p";
            using (var cmd = new SqlCommand(kitchenQuery, conn))
            {
                cmd.Parameters.AddWithValue("@u", username);
                cmd.Parameters.AddWithValue("@p", password);
                using var r = await cmd.ExecuteReaderAsync(ct);
                if (await r.ReadAsync(ct))
                {
                    return new User
                    {
                        Username = username,
                        Role = "Kitchen",
                        FullName = "Kitchen Staff",
                        Email = "kitchen@grandhorizon.com"
                    };
                }
            }
        }
        catch
        {
            // Ignore database unreachable errors and rely on memory store
        }

        return null;
    }
}
