using Microsoft.EntityFrameworkCore;
using HotelApp.Domain.Entities;

namespace HotelApp.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Item> Items => Set<Item>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ─── Product Configuration ──────────────────────
        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("Products");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Category).IsRequired().HasMaxLength(100);
            entity.Property(e => e.SKU).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.SKU).IsUnique();
            entity.HasIndex(e => e.Category);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(20);
        });

        // ─── Item Configuration ─────────────────────────
        modelBuilder.Entity<Item>(entity =>
        {
            entity.ToTable("Items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18,2)");
            entity.HasIndex(e => e.ProductId);

            entity.HasOne(e => e.Product)
                .WithMany(p => p.Items)
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed data
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, Name = "Luxury Pillow Set", Description = "Egyptian cotton 1000-thread-count pillow set", Price = 89.99m, Category = "Bedding", SKU = "BED-PIL-001", Status = ProductStatus.Active, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 2, Name = "Premium Toiletry Kit", Description = "Organic bath amenities collection", Price = 45.50m, Category = "Amenities", SKU = "AMN-TOL-001", Status = ProductStatus.Active, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Product { Id = 3, Name = "Room Service Menu", Description = "In-room dining premium selection", Price = 35.00m, Category = "Dining", SKU = "DIN-RSM-001", Status = ProductStatus.Active, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        modelBuilder.Entity<Item>().HasData(
            new Item { Id = 1, Name = "King Size Pillow", Description = "Hypoallergenic goose feather", Quantity = 100, UnitPrice = 29.99m, ProductId = 1, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Item { Id = 2, Name = "Standard Pillow", Description = "Memory foam standard", Quantity = 200, UnitPrice = 19.99m, ProductId = 1, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Item { Id = 3, Name = "Shampoo Bottle", Description = "Organic lavender shampoo 250ml", Quantity = 500, UnitPrice = 8.50m, ProductId = 2, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Item { Id = 4, Name = "Bath Soap", Description = "Artisan olive oil soap bar", Quantity = 300, UnitPrice = 5.99m, ProductId = 2, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Item { Id = 5, Name = "Breakfast Platter", Description = "Continental breakfast for two", Quantity = 50, UnitPrice = 24.99m, ProductId = 3, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );
    }
}
