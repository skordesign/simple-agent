using System.Collections.Concurrent;
using SimpleAgent.Api.Models;

namespace SimpleAgent.Api.Services;

public interface IConversationStore
{
    List<ConversationMessage> GetOrCreate(string sessionId);
    void Add(string sessionId, ConversationMessage message);
    bool Delete(string sessionId);
}

public class ConversationStore : IConversationStore
{
    private readonly ConcurrentDictionary<string, List<ConversationMessage>> _sessions = new();

    public List<ConversationMessage> GetOrCreate(string sessionId)
        => _sessions.GetOrAdd(sessionId, _ => []);

    public void Add(string sessionId, ConversationMessage message)
    {
        var history = GetOrCreate(sessionId);
        lock (history)
        {
            history.Add(message);
        }
    }

    public bool Delete(string sessionId)
        => _sessions.TryRemove(sessionId, out _);
}
