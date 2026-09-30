using HotelApp.Domain.Entities;

namespace HotelApp.Domain.Interfaces;

public interface IItemRepository
{
    Task<IEnumerable<Item>> GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<Item>> GetByProductIdAsync(int productId, CancellationToken ct = default);
    Task<Item?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<Item> CreateAsync(Item item, CancellationToken ct = default);
    Task<bool> UpdateAsync(Item item, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}
