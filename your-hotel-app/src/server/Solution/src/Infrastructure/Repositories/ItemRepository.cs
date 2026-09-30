using Microsoft.EntityFrameworkCore;
using HotelApp.Domain.Entities;
using HotelApp.Domain.Interfaces;
using HotelApp.Infrastructure.Data;

namespace HotelApp.Infrastructure.Repositories;

public class ItemRepository : IItemRepository
{
    private readonly ApplicationDbContext _context;

    public ItemRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Item>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.Items
            .AsNoTracking()
            .Include(i => i.Product)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<IEnumerable<Item>> GetByProductIdAsync(int productId, CancellationToken ct = default)
    {
        return await _context.Items
            .AsNoTracking()
            .Include(i => i.Product)
            .Where(i => i.ProductId == productId)
            .OrderBy(i => i.Name)
            .ToListAsync(ct);
    }

    public async Task<Item?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await _context.Items
            .Include(i => i.Product)
            .FirstOrDefaultAsync(i => i.Id == id, ct);
    }

    public async Task<Item> CreateAsync(Item item, CancellationToken ct = default)
    {
        _context.Items.Add(item);
        await _context.SaveChangesAsync(ct);

        // Reload with navigation property
        await _context.Entry(item).Reference(i => i.Product).LoadAsync(ct);
        return item;
    }

    public async Task<bool> UpdateAsync(Item item, CancellationToken ct = default)
    {
        _context.Items.Update(item);
        return await _context.SaveChangesAsync(ct) > 0;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var item = await _context.Items.FindAsync(new object[] { id }, ct);
        if (item == null) return false;

        _context.Items.Remove(item);
        return await _context.SaveChangesAsync(ct) > 0;
    }
}
