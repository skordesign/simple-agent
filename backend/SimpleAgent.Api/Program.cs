using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using SimpleAgent.Api.Models;
using SimpleAgent.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Options
builder.Services.Configure<AzureOpenAIOptions>(
    builder.Configuration.GetSection(AzureOpenAIOptions.SectionName));

// Services
builder.Services.AddSingleton<IConversationStore, ConversationStore>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddControllers();

// CORS — origins from env var (comma-separated) + localhost defaults
var corsOrigins = (builder.Configuration["CORS_ORIGINS"] ?? "")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Concat(["http://localhost:3000", "https://localhost:3000", "http://localhost:3001"])
    .Distinct()
    .ToArray();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(corsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Increase form size limit for file uploads (10 MB)
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(o =>
{
    o.MultipartBodyLengthLimit = 10 * 1024 * 1024;
});

// Rate limiting — cookie-based sliding window (20 req/min per client)
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("chat-limit", context =>
    {
        var cookieValue = context.Request.Cookies["client_id"];
        if (string.IsNullOrEmpty(cookieValue))
        {
            cookieValue = Guid.NewGuid().ToString("N");
            context.Response.Cookies.Append("client_id", cookieValue, new CookieOptions
            {
                HttpOnly = true,
                SameSite = SameSiteMode.None,
                Secure = true,
                MaxAge = TimeSpan.FromDays(30),
                Path = "/",
            });
        }

        return RateLimitPartition.GetSlidingWindowLimiter(cookieValue, _ => new SlidingWindowRateLimiterOptions
        {
            PermitLimit = 20,
            Window = TimeSpan.FromMinutes(1),
            SegmentsPerWindow = 4,
            QueueLimit = 0,
        });
    });

    options.RejectionStatusCode = 429;
    options.OnRejected = async (ctx, token) =>
    {
        ctx.HttpContext.Response.ContentType = "text/plain";
        await ctx.HttpContext.Response.WriteAsync(
            "Too many requests. Please wait a moment before sending another message.", token);
    };
});

var app = builder.Build();

app.UseCors("Frontend");
app.UseRateLimiter();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.Run();
