using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using HotelApp.Application.DTOs;
using HotelApp.Application.Interfaces;
using HotelApp.Domain.Interfaces;

namespace HotelApp.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IAuthRepository _authRepo;
    private readonly IConfiguration _config;

    public AuthService(IAuthRepository authRepo, IConfiguration config)
    {
        _authRepo = authRepo;
        _config = config;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _authRepo.GetUserAsync(request.Username, request.Password, ct);
        if (user == null) return null;

        var secret = _config["JwtSettings:Secret"] ?? "SuperSecretKeyForHotelManagementSystemJwtSigningEnterpriseGrade2026!";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Username),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("name", user.FullName),
            new Claim("email", user.Email)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(900),
            Issuer = _config["JwtSettings:Issuer"] ?? "GrandHorizonPalace",
            Audience = _config["JwtSettings:Audience"] ?? "GrandHorizonClients",
            SigningCredentials = creds
        };

        var handler = new JwtSecurityTokenHandler();
        var token = handler.CreateToken(tokenDescriptor);

        return new LoginResponse
        {
            Token = handler.WriteToken(token),
            ExpiresIn = 900 * 60,
            Role = user.Role,
            User = new UserProfileDto
            {
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role
            }
        };
    }
}
