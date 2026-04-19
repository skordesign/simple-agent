namespace SimpleAgent.Api.Models;

public record ChatRequest(string Message);

public record UploadResponse(string FileId, string FileName, string ContentType, long Size);

public class ConversationMessage
{
    public string Role { get; set; } = string.Empty; // "user" | "assistant" | "system"
    public string Content { get; set; } = string.Empty;
    public List<FileAttachment>? Attachments { get; set; }
}

public class FileAttachment
{
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public string Data { get; set; } = string.Empty; // base64 for images, plain text for text files
    public bool IsImage => ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase);
}
