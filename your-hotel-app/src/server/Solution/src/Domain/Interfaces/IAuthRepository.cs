using HotelApp.Domain.Entities;

namespace HotelApp.Domain.Interfaces;

public interface IAuthRepository
{
    Task<User?> GetUserAsync(string username, string password, CancellationToken ct = default);
}
