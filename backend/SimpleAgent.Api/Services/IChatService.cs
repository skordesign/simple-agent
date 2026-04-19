using SimpleAgent.Api.Models;

namespace SimpleAgent.Api.Services;

public interface IChatService
{
    IAsyncEnumerable<string> StreamAsync(
        string sessionId,
        string userMessage,
        IEnumerable<FileAttachment> attachments,
        CancellationToken cancellationToken = default);
}
