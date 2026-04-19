# Changelogs

## 2026-04-19 — Feature additions

### Added
- **PDF support:** Upload `.pdf` files — backend extracts text via `PdfPig` and sends it as plain content to the LLM; frontend allows `.pdf` in the file picker and MIME filter
- **Copy button on code blocks:** Hovering a fenced code block reveals a Copy/Copied! button (top-right overlay) via a custom `pre` renderer in `react-markdown`
- **Configurable greeting name:** `NEXT_PUBLIC_GREETING_NAME` env var controls the name in the greeting; falls back to `"there"`

## 2026-04-19 — Initial build

### Added
- **Backend:** ASP.NET Core Web API (.NET 10) with Azure OpenAI SSE streaming
  - `POST /api/chat/stream` — Server-Sent Events chat endpoint (multipart + JSON)
  - `DELETE /api/chat/session` — Clear in-memory conversation history
  - `ConversationStore` — thread-safe in-memory session management per UUID
  - `ChatService` — Azure OpenAI streaming via `IAsyncEnumerable`, vision + text file support
  - Config via `appsettings.json` Azure OpenAI format
- **Frontend:** Next.js 16 + TailwindCSS v4 + TypeScript
  - Animated purple/blue orb hero inspired by reference design
  - Time-aware greeting ("Good Morning/Afternoon/Evening")
  - Expandable textarea with drag-and-drop file attachment
  - SSE streaming — tokens render in real-time with blinking cursor
  - File attachment pills with type icons (images/text)
  - Action chips: Reasoning, Analyze File, Summarize
  - Clear conversation button
  - Smooth hero→chat layout transition on first message
  - `react-markdown` rendering for AI responses
  - `lucide-react` icons
- **Docs:** `CLAUDE.md`, `docs/CURRENT_PLAN.md`
