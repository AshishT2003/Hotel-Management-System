using Microsoft.EntityFrameworkCore;
using HotelApp.Domain.Entities;
using HotelApp.Domain.Interfaces;
using HotelApp.Infrastructure.Data;

namespace HotelApp.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly ApplicationDbContext _context;

    public ProductRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Product>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.Products
            .AsNoTracking()
            .Include(p => p.Items)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<Product?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await _context.Products
            .Include(p => p.Items)
            .FirstOrDefaultAsync(p => p.Id == id, ct);
    }

    public async Task<Product> CreateAsync(Product product, CancellationToken ct = default)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync(ct);
        return product;
    }

    public async Task<bool> UpdateAsync(Product product, CancellationToken ct = default)
    {
        _context.Products.Update(product);
        return await _context.SaveChangesAsync(ct) > 0;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var product = await _context.Products.FindAsync(new object[] { id }, ct);
        if (product == null) return false;

        _context.Products.Remove(product);
        return await _context.SaveChangesAsync(ct) > 0;
    }

    public async Task<bool> ExistsAsync(int id, CancellationToken ct = default)
    {
        return await _context.Products.AnyAsync(p => p.Id == id, ct);
    }
}
