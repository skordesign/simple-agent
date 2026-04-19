using Microsoft.AspNetCore.Mvc;
using SimpleAgent.Api.Models;
using SimpleAgent.Api.Services;
using System.Text;
using System.Text.Json;

namespace SimpleAgent.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private const string SessionHeader = "X-Session-Id";
    private const long MaxFileSize = 10 * 1024 * 1024; // 10 MB
    private static readonly HashSet<string> AllowedTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "text/plain", "text/markdown", "text/csv",
        "application/json", "application/xml",
        "image/jpeg", "image/png", "image/gif", "image/webp"
    };

    private readonly IChatService _chatService;
    private readonly IConversationStore _store;
    private readonly ILogger<ChatController> _logger;

    public ChatController(IChatService chatService, IConversationStore store, ILogger<ChatController> logger)
    {
        _chatService = chatService;
        _store = store;
        _logger = logger;
    }

    /// <summary>
    /// Streams a chat response using Server-Sent Events.
    /// </summary>
    [HttpPost("stream")]
    public async Task StreamMessage(CancellationToken cancellationToken)
    {
        var sessionId = GetSessionId();
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            Response.StatusCode = 400;
            await Response.WriteAsync("X-Session-Id header is required.", cancellationToken);
            return;
        }

        string message;
        List<FileAttachment> attachments = [];

        if (Request.HasFormContentType)
        {
            var form = await Request.ReadFormAsync(cancellationToken);
            message = form["message"].FirstOrDefault() ?? string.Empty;
            attachments = await ParseAttachmentsAsync(form.Files, cancellationToken);
        }
        else
        {
            using var reader = new StreamReader(Request.Body, Encoding.UTF8);
            var body = await reader.ReadToEndAsync(cancellationToken);
            var req = JsonSerializer.Deserialize<ChatRequest>(body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            message = req?.Message ?? string.Empty;
        }

        if (string.IsNullOrWhiteSpace(message))
        {
            Response.StatusCode = 400;
            await Response.WriteAsync("Message is required.", cancellationToken);
            return;
        }

        Response.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Connection = "keep-alive";

        try
        {
            await foreach (var token in _chatService.StreamAsync(sessionId, message, attachments, cancellationToken))
            {
                var data = JsonSerializer.Serialize(new { token });
                await Response.WriteAsync($"data: {data}\n\n", cancellationToken);
                await Response.Body.FlushAsync(cancellationToken);
            }

            await Response.WriteAsync("data: [DONE]\n\n", cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);
        }
        catch (OperationCanceledException)
        {
            // Client disconnected — normal
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error streaming chat for session {SessionId}", sessionId);
            if (!Response.HasStarted)
            {
                Response.StatusCode = 500;
            }
            else
            {
                var errData = JsonSerializer.Serialize(new { error = "An error occurred." });
                await Response.WriteAsync($"data: {errData}\n\n", cancellationToken);
                await Response.Body.FlushAsync(cancellationToken);
            }
        }
    }

    /// <summary>
    /// Clears the conversation history for the session.
    /// </summary>
    [HttpDelete("session")]
    public IActionResult ClearSession()
    {
        var sessionId = GetSessionId();
        if (string.IsNullOrWhiteSpace(sessionId))
            return BadRequest("X-Session-Id header is required.");

        _store.Delete(sessionId);
        return NoContent();
    }

    private string? GetSessionId()
        => Request.Headers.TryGetValue(SessionHeader, out var val) ? val.ToString() : null;

    private static async Task<List<FileAttachment>> ParseAttachmentsAsync(
        IFormFileCollection files,
        CancellationToken cancellationToken)
    {
        var result = new List<FileAttachment>();

        foreach (var file in files)
        {
            if (file.Length == 0 || file.Length > MaxFileSize)
                continue;

            var contentType = file.ContentType;
            if (!AllowedTypes.Contains(contentType))
                continue;

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms, cancellationToken);
            var bytes = ms.ToArray();

            string data;
            if (contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            {
                data = Convert.ToBase64String(bytes);
            }
            else
            {
                data = Encoding.UTF8.GetString(bytes);
            }

            result.Add(new FileAttachment
            {
                FileName = file.FileName,
                ContentType = contentType,
                Data = data
            });
        }

        return result;
    }
}
