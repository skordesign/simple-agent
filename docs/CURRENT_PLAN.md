# Simple Agent — Portfolio Project Plan

**Status:** PLANNING (awaiting user confirmation)
**Date:** 2026-04-19

---

## Problem Statement

Build a portfolio-quality AI chat agent web app that:
- Answers user questions using an LLM (Azure OpenAI)
- Supports file attachments (text, PDF, images)
- Keeps conversation context in-memory per session (no persistence)
- Has a modern, performant UI inspired by the reference design

---

## Architecture

```
simple-agent/
├── backend/               # ASP.NET Core Web API (.NET 10)
│   ├── SimpleAgent.Api/
│   │   ├── Controllers/
│   │   │   └── ChatController.cs
│   │   ├── Services/
│   │   │   ├── IChatService.cs
│   │   │   ├── ChatService.cs
│   │   │   └── ConversationStore.cs   # In-memory session store
│   │   ├── Models/
│   │   │   ├── ChatRequest.cs
│   │   │   ├── ChatMessage.cs
│   │   │   └── ChatResponse.cs
│   │   ├── appsettings.json           # Azure OpenAI config
│   │   ├── appsettings.Development.json
│   │   └── Program.cs
│   └── SimpleAgent.Api.csproj
└── frontend/              # Next.js 14 (App Router) + TailwindCSS + TypeScript
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx               # Main chat page
    │   │   └── globals.css
    │   ├── components/
    │   │   ├── Chat/
    │   │   │   ├── ChatInput.tsx      # Input box with file attach + send
    │   │   │   ├── ChatMessages.tsx   # Message list
    │   │   │   ├── MessageBubble.tsx  # Individual message
    │   │   │   └── TypingIndicator.tsx
    │   │   ├── ui/
    │   │   │   ├── OrbAnimation.tsx   # Animated purple/blue orb
    │   │   │   └── GreetingHeader.tsx
    │   │   └── FileAttachment.tsx
    │   ├── hooks/
    │   │   ├── useChat.ts             # Chat state + API calls
    │   │   └── useGreeting.ts         # Time-based greeting
    │   ├── lib/
    │   │   └── api.ts                 # Backend API client
    │   └── types/
    │       └── chat.ts
    ├── tailwind.config.ts
    ├── next.config.ts
    └── package.json
```

---

## Tech Stack

### Backend
- **Framework:** ASP.NET Core Web API (.NET 10)
- **LLM SDK:** Azure.AI.OpenAI (official Azure OpenAI SDK)
- **File handling:** IFormFile multipart upload, base64 encoding for vision
- **Session store:** ConcurrentDictionary<string, List<ChatMessage>> (in-memory)
- **Streaming:** Server-Sent Events (SSE) via IAsyncEnumerable + StreamContent
- **CORS:** Configured for localhost:3000 in dev

### Frontend
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** TailwindCSS v3
- **State:** React hooks (useState, useRef, useCallback) — no external state lib needed
- **HTTP:** fetch with SSE streaming support
- **Animations:** CSS animations + Tailwind animate plugin

---

## LLM Configuration (appsettings.json format)

```json
{
  "AzureOpenAI": {
    "Endpoint": "https://<your-resource>.openai.azure.com/",
    "ApiKey": "<your-api-key>",
    "DeploymentName": "gpt-4o",
    "ApiVersion": "2024-02-01",
    "MaxTokens": 2048,
    "SystemPrompt": "You are a helpful AI assistant."
  }
}
```

---

## Key Features

1. **Chat with streaming** — SSE from backend, streamed token-by-token in UI
2. **File attachments** — Multipart upload; text files sent as content, images sent as base64 to vision model
3. **In-memory conversation history** — Per `sessionId` (UUID generated client-side, sent in header)
4. **Time-based greeting** — Good Morning/Afternoon/Evening with username from config/env
5. **Animated orb** — CSS radial gradient with blur animation (purple/blue)
6. **Modern input** — Expandable textarea, drag-and-drop file, tag pills for attachments

---

## Files to Create

### Backend (14 files)
| File | Purpose |
|------|---------|
| `backend/SimpleAgent.Api/SimpleAgent.Api.csproj` | Project file with NuGet refs |
| `backend/SimpleAgent.Api/Program.cs` | App setup, DI, CORS, SSE |
| `backend/SimpleAgent.Api/appsettings.json` | AzureOpenAI config template |
| `backend/SimpleAgent.Api/appsettings.Development.json` | Dev overrides |
| `backend/SimpleAgent.Api/Controllers/ChatController.cs` | POST /api/chat, POST /api/chat/upload |
| `backend/SimpleAgent.Api/Services/IChatService.cs` | Interface |
| `backend/SimpleAgent.Api/Services/ChatService.cs` | Azure OpenAI calls + streaming |
| `backend/SimpleAgent.Api/Services/ConversationStore.cs` | In-memory session management |
| `backend/SimpleAgent.Api/Models/ChatRequest.cs` | Request model |
| `backend/SimpleAgent.Api/Models/ChatMessage.cs` | Message model |
| `backend/SimpleAgent.Api/Models/ChatResponse.cs` | Response model |
| `backend/SimpleAgent.Api/Models/UploadResponse.cs` | File upload response |
| `backend/SimpleAgent.Api/Models/AzureOpenAIOptions.cs` | Options class |
| `backend/SimpleAgent.Api/.gitignore` | Ignore secrets |

### Frontend (16 files)
| File | Purpose |
|------|---------|
| `frontend/package.json` | Dependencies |
| `frontend/next.config.ts` | Next.js config (API proxy) |
| `frontend/tailwind.config.ts` | Tailwind with custom colors/animations |
| `frontend/tsconfig.json` | TypeScript config |
| `frontend/src/app/layout.tsx` | Root layout, fonts |
| `frontend/src/app/page.tsx` | Main page |
| `frontend/src/app/globals.css` | Global styles, CSS vars |
| `frontend/src/components/Chat/ChatInput.tsx` | Input + file attach |
| `frontend/src/components/Chat/ChatMessages.tsx` | Message list |
| `frontend/src/components/Chat/MessageBubble.tsx` | Message bubble |
| `frontend/src/components/Chat/TypingIndicator.tsx` | "Thinking..." animation |
| `frontend/src/components/ui/OrbAnimation.tsx` | Animated orb |
| `frontend/src/components/ui/GreetingHeader.tsx` | Greeting text |
| `frontend/src/hooks/useChat.ts` | Chat logic hook |
| `frontend/src/hooks/useGreeting.ts` | Time greeting hook |
| `frontend/src/lib/api.ts` | API client with SSE |
| `frontend/src/types/chat.ts` | TypeScript types |

---

## API Design

### POST /api/chat
```
Headers: X-Session-Id: <uuid>
Body: multipart/form-data
  - message: string
  - files[]: File[] (optional)
Response: text/event-stream (SSE)
  data: {"token": "Hello"}
  data: {"token": " world"}
  data: [DONE]
```

### DELETE /api/chat/session
```
Headers: X-Session-Id: <uuid>
Response: 204 No Content
```

---

## UI Design Reference

Based on the provided image:
- **Background:** Light gray/white with subtle gradient (#F8F9FF → #EEF0FB)
- **Orb:** Animated radial gradient (indigo/purple blur) centered at top
- **Greeting:** Bold black + blue accent ("How Can I **Assist You Today?**")
- **Input box:** White card with soft shadow, rounded-2xl
- **Input area:** Multi-line textarea, placeholder with sparkle emoji prefix
- **Bottom bar:** Icon buttons for attach, Reasoning, Create Image, Deep Research + send button
- **Messages:** Appear below/above input, user messages right-aligned, AI left-aligned

---

## Test Strategy

- **Backend:** xUnit tests for ConversationStore, ChatService (mocked Azure client)
- **Frontend:** No automated tests (portfolio project, UI-focused)
- **Manual:** Run both servers, test send message, file upload, conversation continuity

---

## Completion Status

- [x] Phase 1: Plan confirmed — 2026-04-19
- [x] Phase 2: Development complete — 2026-04-19
- [x] Phase 3: Build/lint verified — backend 0 errors, frontend 0 errors
- [x] Phase 4: Summary written — 2026-04-19
