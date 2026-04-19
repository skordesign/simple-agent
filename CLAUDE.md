# Simple Agent — Project CLAUDE.md

## Project Overview
Portfolio AI chat agent. Backend: ASP.NET Core Web API (.NET 10). Frontend: Next.js 16 + TailwindCSS v4 + TypeScript.

## Tech Stack

### Backend
- **Framework:** ASP.NET Core Web API (.NET 10)
- **LLM SDK:** Azure.AI.OpenAI 2.1.0
- **Session store:** In-memory `ConcurrentDictionary` — no database
- **Streaming:** Server-Sent Events (SSE) via `IAsyncEnumerable`
- **Project path:** `backend/SimpleAgent.Api/`

### Frontend
- **Framework:** Next.js 16 (App Router)
- **CSS:** TailwindCSS v4 — use `@import "tailwindcss"` and `@theme` in CSS, NOT `tailwind.config.js`
- **Icons:** lucide-react
- **Markdown:** react-markdown
- **Project path:** `frontend/`

## Build Commands
```bash
# Backend
cd backend/SimpleAgent.Api && dotnet build
cd backend/SimpleAgent.Api && dotnet run   # http://localhost:5000

# Frontend
cd frontend && npm run build
cd frontend && npm run dev                  # http://localhost:3000
```

## Coding Standards

### Backend
- Use `record` types for immutable DTOs
- Services registered via DI in `Program.cs`
- Config via `IOptions<T>` pattern, bound from `appsettings.json`
- Never store secrets in source — use environment variables or user secrets
- Session ID always from `X-Session-Id` request header

### Frontend
- All interactive components must be `"use client"`
- Tailwind v4: prefer canonical class names (`shrink-0` not `flex-shrink-0`)
- Keep business logic in hooks (`src/hooks/`), UI in components (`src/components/`)
- Types in `src/types/`, API calls in `src/lib/api.ts`
- SSE streaming: use `fetch` + `ReadableStream`, never EventSource (to allow POST)

## Architecture Decisions
- Conversation context is in-memory only per session — never persisted
- Session ID is a UUID generated client-side on page load, sent via header
- File uploads are processed in the controller: text→plain content, images→base64 for vision
- Backend uses SSE (`text/event-stream`) for streaming; format: `data: {"token":"..."}\n\n`
- No auth, no database — this is a portfolio demo

## Azure OpenAI Config (appsettings.json)
```json
{
  "AzureOpenAI": {
    "Endpoint": "https://<resource>.openai.azure.com/",
    "ApiKey": "<key>",
    "DeploymentName": "gpt-4o",
    "ApiVersion": "2024-02-01",
    "MaxTokens": 2048,
    "SystemPrompt": "..."
  }
}
```

## Key Files
| File | Purpose |
|------|---------|
| `backend/SimpleAgent.Api/Controllers/ChatController.cs` | SSE stream endpoint + session clear |
| `backend/SimpleAgent.Api/Services/ChatService.cs` | Azure OpenAI calls, message building |
| `backend/SimpleAgent.Api/Services/ConversationStore.cs` | In-memory session management |
| `frontend/src/hooks/useChat.ts` | Chat state, streaming, session management |
| `frontend/src/lib/api.ts` | Backend API client (SSE streaming) |
| `frontend/src/components/Chat/ChatInput.tsx` | Input box, file attach, toolbar |
| `frontend/src/app/page.tsx` | Main page, layout transitions |
