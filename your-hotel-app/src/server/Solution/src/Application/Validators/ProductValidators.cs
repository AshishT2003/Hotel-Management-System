using FluentValidation;
using HotelApp.Application.DTOs;

namespace HotelApp.Application.Validators;

public class CreateProductValidator : AbstractValidator<CreateProductDto>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required.")
            .MaximumLength(200).WithMessage("Product name must be 200 characters or fewer.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description must be 1000 characters or fewer.");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than zero.");

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Category is required.")
            .MaximumLength(100).WithMessage("Category must be 100 characters or fewer.");

        RuleFor(x => x.SKU)
            .NotEmpty().WithMessage("SKU is required.")
            .MaximumLength(50).WithMessage("SKU must be 50 characters or fewer.");
    }
}

public class UpdateProductValidator : AbstractValidator<UpdateProductDto>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Name)
            .MaximumLength(200).WithMessage("Product name must be 200 characters or fewer.")
            .When(x => x.Name != null);

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than zero.")
            .When(x => x.Price.HasValue);

        RuleFor(x => x.Category)
            .MaximumLength(100).WithMessage("Category must be 100 characters or fewer.")
            .When(x => x.Category != null);

        RuleFor(x => x.SKU)
            .MaximumLength(50).WithMessage("SKU must be 50 characters or fewer.")
            .When(x => x.SKU != null);

        RuleFor(x => x.Status)
            .Must(s => s == null || new[] { "Active", "Inactive", "Discontinued" }.Contains(s, StringComparer.OrdinalIgnoreCase))
            .WithMessage("Status must be Active, Inactive, or Discontinued.");
    }
}

public class CreateItemValidator : AbstractValidator<CreateItemDto>
{
    public CreateItemValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Item name is required.")
            .MaximumLength(200).WithMessage("Item name must be 200 characters or fewer.");

        RuleFor(x => x.Quantity)
            .GreaterThanOrEqualTo(0).WithMessage("Quantity cannot be negative.");

        RuleFor(x => x.UnitPrice)
            .GreaterThan(0).WithMessage("Unit price must be greater than zero.");

        RuleFor(x => x.ProductId)
            .GreaterThan(0).WithMessage("A valid Product ID is required.");
    }
}
