namespace SimpleAgent.Api.Models;

public class AzureOpenAIOptions
{
    public const string SectionName = "AzureOpenAI";

    public string Endpoint { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string DeploymentName { get; set; } = "gpt-4o";
    public string ApiVersion { get; set; } = "2024-02-01";
    public int MaxTokens { get; set; } = 2048;
    public string SystemPrompt { get; set; } = "You are a helpful AI assistant.";
}
