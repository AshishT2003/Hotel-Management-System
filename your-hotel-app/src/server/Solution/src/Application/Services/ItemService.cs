using HotelApp.Application.DTOs;
using HotelApp.Application.Interfaces;
using HotelApp.Domain.Entities;
using HotelApp.Domain.Interfaces;

namespace HotelApp.Application.Services;

public class ItemService : IItemService
{
    private readonly IItemRepository _itemRepo;
    private readonly IProductRepository _productRepo;

    public ItemService(IItemRepository itemRepo, IProductRepository productRepo)
    {
        _itemRepo = itemRepo;
        _productRepo = productRepo;
    }

    public async Task<IEnumerable<ItemDto>> GetAllAsync(CancellationToken ct = default)
    {
        var items = await _itemRepo.GetAllAsync(ct);
        return items.Select(MapToDto);
    }

    public async Task<IEnumerable<ItemDto>> GetByProductIdAsync(int productId, CancellationToken ct = default)
    {
        var items = await _itemRepo.GetByProductIdAsync(productId, ct);
        return items.Select(MapToDto);
    }

    public async Task<ItemDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var item = await _itemRepo.GetByIdAsync(id, ct);
        return item == null ? null : MapToDto(item);
    }

    public async Task<ItemDto> CreateAsync(CreateItemDto dto, CancellationToken ct = default)
    {
        if (!await _productRepo.ExistsAsync(dto.ProductId, ct))
            throw new ArgumentException($"Product with ID {dto.ProductId} does not exist.");

        var entity = new Item
        {
            Name = dto.Name.Trim(),
            Description = dto.Description.Trim(),
            Quantity = dto.Quantity,
            UnitPrice = dto.UnitPrice,
            ProductId = dto.ProductId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _itemRepo.CreateAsync(entity, ct);
        return MapToDto(created);
    }

    public async Task<ItemDto?> UpdateAsync(int id, UpdateItemDto dto, CancellationToken ct = default)
    {
        var existing = await _itemRepo.GetByIdAsync(id, ct);
        if (existing == null) return null;

        if (dto.Name != null) existing.Name = dto.Name.Trim();
        if (dto.Description != null) existing.Description = dto.Description.Trim();
        if (dto.Quantity.HasValue) existing.Quantity = dto.Quantity.Value;
        if (dto.UnitPrice.HasValue) existing.UnitPrice = dto.UnitPrice.Value;

        existing.UpdatedAt = DateTime.UtcNow;

        await _itemRepo.UpdateAsync(existing, ct);
        return MapToDto(existing);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        return await _itemRepo.DeleteAsync(id, ct);
    }

    private static ItemDto MapToDto(Item i) => new()
    {
        Id = i.Id,
        Name = i.Name,
        Description = i.Description,
        Quantity = i.Quantity,
        UnitPrice = i.UnitPrice,
        ProductId = i.ProductId,
        ProductName = i.Product?.Name ?? string.Empty,
        CreatedAt = i.CreatedAt,
        UpdatedAt = i.UpdatedAt
    };
}
