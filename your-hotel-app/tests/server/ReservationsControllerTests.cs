using HotelApp.Server.Controllers;
using HotelApp.Server.DTOs;
using HotelApp.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace HotelApp.Tests.Server;

public class ReservationsControllerTests
{
    private readonly Mock<IReservationService> _serviceMock;
    private readonly ReservationsController _controller;

    public ReservationsControllerTests()
    {
        _serviceMock = new Mock<IReservationService>();
        _controller = new ReservationsController(_serviceMock.Object);
    }

    [Fact]
    public async Task GetAll_ReturnsOkWithList()
    {
        // Arrange
        var mockList = new List<ReservationDto>
        {
            new() { Id = 1, FirstName = "John", LastName = "Doe", RoomNumber = "101" },
            new() { Id = 2, FirstName = "Jane", LastName = "Smith", RoomNumber = "201" },
        };

        _serviceMock
            .Setup(s => s.GetAllAsync(null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockList);

        // Act
        var result = await _controller.GetAll(null, null, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var items = Assert.IsType<List<ReservationDto>>(okResult.Value);
        Assert.Equal(2, items.Count);
    }

    [Fact]
    public async Task GetById_ExistingId_ReturnsOkWithReservation()
    {
        // Arrange
        var dto = new ReservationDto { Id = 101, FirstName = "Alice", LastName = "Wonder" };
        _serviceMock
            .Setup(s => s.GetByIdAsync(101, It.IsAny<CancellationToken>()))
            .ReturnsAsync(dto);

        // Act
        var result = await _controller.GetById(101, CancellationToken.None);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var item = Assert.IsType<ReservationDto>(okResult.Value);
        Assert.Equal(101, item.Id);
    }

    [Fact]
    public async Task GetById_NonExistingId_ReturnsNotFound()
    {
        // Arrange
        _serviceMock
            .Setup(s => s.GetByIdAsync(999, It.IsAny<CancellationToken>()))
            .ReturnsAsync((ReservationDto?)null);

        // Act
        var result = await _controller.GetById(999, CancellationToken.None);

        // Assert
        Assert.IsType<NotFoundObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_ValidDto_ReturnsCreatedAtAction()
    {
        // Arrange
        var createDto = new CreateReservationDto
        {
            FirstName = "Marcus",
            LastName = "Vance",
            RoomNumber = "501",
            RoomType = "Suite"
        };

        var createdDto = new ReservationDto
        {
            Id = 1005,
            FirstName = "Marcus",
            LastName = "Vance",
            RoomNumber = "501",
            RoomType = "Suite"
        };

        _serviceMock
            .Setup(s => s.CreateAsync(createDto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdDto);

        // Act
        var result = await _controller.Create(createDto, CancellationToken.None);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var item = Assert.IsType<ReservationDto>(createdResult.Value);
        Assert.Equal(1005, item.Id);
    }

    [Fact]
    public async Task Create_EmptyName_ReturnsBadRequest()
    {
        // Arrange
        var invalidDto = new CreateReservationDto
        {
            FirstName = "",
            LastName = "",
            RoomNumber = "101"
        };

        // Act
        var result = await _controller.Create(invalidDto, CancellationToken.None);

        // Assert
        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        var err = Assert.IsType<ErrorResponseDto>(badRequest.Value);
        Assert.Equal("VALIDATION_FAILED", err.Code);
    }

    [Fact]
    public async Task ToggleCheckIn_ValidId_ReturnsOk()
    {
        // Arrange
        _serviceMock
            .Setup(s => s.ToggleCheckInAsync(101, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.ToggleCheckIn(101, new CheckInDto { CheckIn = true }, CancellationToken.None);

        // Assert
        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task Delete_ExistingId_ReturnsNoContent()
    {
        // Arrange
        _serviceMock
            .Setup(s => s.DeleteAsync(101, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.Delete(101, CancellationToken.None);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }
}
