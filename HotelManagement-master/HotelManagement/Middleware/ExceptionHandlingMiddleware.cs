using System.Net;
using System.Text.Json;
using HotelApp.Server.DTOs;

namespace HotelApp.Server.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled server exception. TraceId: {TraceId}", context.TraceIdentifier);
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var error = new ErrorResponseDto
            {
                Error = "An internal server error occurred. Please contact the front desk administrator.",
                Code = "INTERNAL_SERVER_ERROR",
                TraceId = context.TraceIdentifier,
                Timestamp = DateTime.UtcNow
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(error));
        }
    }
}
