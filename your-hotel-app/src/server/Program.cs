using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using HotelApp.Server.Middleware;
using HotelApp.Server.Repositories;
using HotelApp.Server.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Dependency Injection Registrations
builder.Services.AddSingleton<IBillingService, BillingService>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IReservationRepository, ReservationRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IReservationService, ReservationService>();
builder.Services.AddScoped<IKitchenService, KitchenService>();
builder.Services.AddScoped<IRoomService, RoomService>();
builder.Services.AddScoped<IGuestBookingService, GuestBookingService>();
builder.Services.AddSingleton<IHousekeepingService, HousekeepingService>();
builder.Services.AddSingleton<IGuestProfileService, GuestProfileService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 2. Swagger / OpenAPI Documentation with JWT Support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Grand Horizon Palace Hotel Management API",
        Version = "v1",
        Description = "Enterprise REST API for 50-room hotel management, real-time kitchen queues, and automated billing."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT Bearer token."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// 3. CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClientApps", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 4. JWT Authentication
var jwtSecret = builder.Configuration["JwtSettings:Secret"] ?? "SuperSecretKeyForHotelManagementSystemJwtSigningEnterpriseGrade2026!";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "GrandHorizonPalace",
            ValidAudience = builder.Configuration["JwtSettings:Audience"] ?? "GrandHorizonClients",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// 5. Middleware Pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Grand Horizon Palace API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowClientApps");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
