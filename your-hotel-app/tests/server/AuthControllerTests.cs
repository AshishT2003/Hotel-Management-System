using HotelApp.Server.Controllers;
using HotelApp.Server.DTOs;
using HotelApp.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace HotelApp.Tests.Server;

public class AuthControllerTests
{
    private readonly Mock<IAuthService> _authServiceMock;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _authServiceMock = new Mock<IAuthService>();
        _controller = new AuthController(_authServiceMock.Object);
    }

    [Fact]
    public async Task Login_ValidCredentials_ReturnsOkWithTokenAndRole()
    {
        // Arrange
        var request = new LoginRequest { Username = "admin", Password = "password123" };
        var expectedResponse = new LoginResponse
        {
            Token = "valid_jwt_token_sample",
            Role = "Admin",
            ExpiresIn = 900,
            User = new UserProfileDto { Username = "admin", FullName = "Front Desk Admin", Role = "Admin" }
        };

        _authServiceMock
            .Setup(s => s.LoginAsync(It.IsAny<LoginRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResponse);

        // Act
        var actionResult = await _controller.Login(request, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(actionResult.Result);
        var response = Assert.IsType<LoginResponse>(okResult.Value);
        Assert.Equal("valid_jwt_token_sample", response.Token);
        Assert.Equal("Admin", response.Role);
    }

    [Fact]
    public async Task Login_InvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        var request = new LoginRequest { Username = "admin", Password = "wrongpassword" };

        _authServiceMock
            .Setup(s => s.LoginAsync(It.IsAny<LoginRequest>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((LoginResponse?)null);

        // Act
        var actionResult = await _controller.Login(request, CancellationToken.None);

        // Assert
        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(actionResult.Result);
        var err = Assert.IsType<ErrorResponseDto>(unauthorized.Value);
        Assert.Equal("AUTH_INVALID_CREDENTIALS", err.Code);
    }

    [Theory]
    [InlineData("", "password")]
    [InlineData("admin", "")]
    [InlineData("   ", "   ")]
    public async Task Login_EmptyCredentials_ReturnsBadRequest(string username, string password)
    {
        // Arrange
        var request = new LoginRequest { Username = username, Password = password };

        // Act
        var actionResult = await _controller.Login(request, CancellationToken.None);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(actionResult.Result);
        var err = Assert.IsType<ErrorResponseDto>(badRequest.Value);
        Assert.Equal("INVALID_PAYLOAD", err.Code);
    }
}
