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

var app = builder.Build();

app.UseCors("Frontend");
app.UseAuthorization();
app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.Run();
