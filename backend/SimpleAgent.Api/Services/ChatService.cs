using System.Runtime.CompilerServices;
using Azure;
using Azure.AI.OpenAI;
using Microsoft.Extensions.Options;
using OpenAI.Chat;
using SimpleAgent.Api.Models;

namespace SimpleAgent.Api.Services;

public class ChatService : IChatService
{
    private readonly AzureOpenAIClient _client;
    private readonly AzureOpenAIOptions _options;
    private readonly IConversationStore _store;
    private readonly ILogger<ChatService> _logger;

    public ChatService(
        IOptions<AzureOpenAIOptions> options,
        IConversationStore store,
        ILogger<ChatService> logger)
    {
        _options = options.Value;
        _store = store;
        _logger = logger;
        _client = new AzureOpenAIClient(
            new Uri(_options.Endpoint),
            new AzureKeyCredential(_options.ApiKey));
    }

    public async IAsyncEnumerable<string> StreamAsync(
        string sessionId,
        string userMessage,
        IEnumerable<FileAttachment> attachments,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var history = _store.GetOrCreate(sessionId);
        var chatClient = _client.GetChatClient(_options.DeploymentName);

        var messages = BuildMessages(history, userMessage, attachments);

        // Store user turn
        _store.Add(sessionId, new ConversationMessage
        {
            Role = "user",
            Content = userMessage,
            Attachments = attachments.ToList()
        });

        var assistantContent = new System.Text.StringBuilder();

        var streamOptions = new ChatCompletionOptions
        {
            MaxOutputTokenCount = _options.MaxTokens
        };

        await foreach (var update in chatClient.CompleteChatStreamingAsync(messages, streamOptions, cancellationToken))
        {
            foreach (var part in update.ContentUpdate)
            {
                if (!string.IsNullOrEmpty(part.Text))
                {
                    assistantContent.Append(part.Text);
                    yield return part.Text;
                }
            }
        }

        // Store assistant turn
        if (assistantContent.Length > 0)
        {
            _store.Add(sessionId, new ConversationMessage
            {
                Role = "assistant",
                Content = assistantContent.ToString()
            });
        }
    }

    private List<ChatMessage> BuildMessages(
        List<ConversationMessage> history,
        string userMessage,
        IEnumerable<FileAttachment> attachments)
    {
        var messages = new List<ChatMessage>
        {
            new SystemChatMessage(_options.SystemPrompt)
        };

        lock (history)
        {
            foreach (var msg in history)
            {
                if (msg.Role == "user")
                    messages.Add(new UserChatMessage(msg.Content));
                else if (msg.Role == "assistant")
                    messages.Add(new AssistantChatMessage(msg.Content));
            }
        }

        // Build current user message with optional attachments
        var contentParts = new List<ChatMessageContentPart>();

        foreach (var file in attachments)
        {
            if (file.IsImage)
            {
                var bytes = Convert.FromBase64String(file.Data);
                var imgPart = ChatMessageContentPart.CreateImagePart(
                    BinaryData.FromBytes(bytes),
                    file.ContentType);
                contentParts.Add(imgPart);
            }
            else
            {
                // Inject text file content inline
                contentParts.Add(ChatMessageContentPart.CreateTextPart(
                    $"[File: {file.FileName}]\n{file.Data}\n"));
            }
        }

        contentParts.Add(ChatMessageContentPart.CreateTextPart(userMessage));
        messages.Add(new UserChatMessage(contentParts));

        return messages;
    }
}
