using HotelApp.Application.DTOs;
using HotelApp.Application.Interfaces;
using HotelApp.Domain.Entities;
using HotelApp.Domain.Interfaces;

namespace HotelApp.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repo;

    public ProductService(IProductRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<ProductDto>> GetAllAsync(CancellationToken ct = default)
    {
        var products = await _repo.GetAllAsync(ct);
        return products.Select(MapToDto);
    }

    public async Task<ProductDto?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var product = await _repo.GetByIdAsync(id, ct);
        return product == null ? null : MapToDto(product);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken ct = default)
    {
        var entity = new Product
        {
            Name = dto.Name.Trim(),
            Description = dto.Description.Trim(),
            Price = dto.Price,
            Category = dto.Category.Trim(),
            SKU = dto.SKU.Trim(),
            Status = ProductStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _repo.CreateAsync(entity, ct);
        return MapToDto(created);
    }

    public async Task<ProductDto?> UpdateAsync(int id, UpdateProductDto dto, CancellationToken ct = default)
    {
        var existing = await _repo.GetByIdAsync(id, ct);
        if (existing == null) return null;

        if (dto.Name != null) existing.Name = dto.Name.Trim();
        if (dto.Description != null) existing.Description = dto.Description.Trim();
        if (dto.Price.HasValue) existing.Price = dto.Price.Value;
        if (dto.Category != null) existing.Category = dto.Category.Trim();
        if (dto.SKU != null) existing.SKU = dto.SKU.Trim();
        if (dto.Status != null && Enum.TryParse<ProductStatus>(dto.Status, true, out var status))
            existing.Status = status;

        existing.UpdatedAt = DateTime.UtcNow;

        await _repo.UpdateAsync(existing, ct);
        return MapToDto(existing);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        return await _repo.DeleteAsync(id, ct);
    }

    private static ProductDto MapToDto(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description,
        Price = p.Price,
        Category = p.Category,
        SKU = p.SKU,
        Status = p.Status.ToString(),
        CreatedAt = p.CreatedAt,
        UpdatedAt = p.UpdatedAt,
        Items = p.Items?.Select(i => new ItemDto
        {
            Id = i.Id,
            Name = i.Name,
            Description = i.Description,
            Quantity = i.Quantity,
            UnitPrice = i.UnitPrice,
            ProductId = i.ProductId,
            ProductName = p.Name,
            CreatedAt = i.CreatedAt,
            UpdatedAt = i.UpdatedAt
        }).ToList() ?? new()
    };
}
