# Changelogs

## 2026-04-19 — Metadata + spam prevention

### Added
- **Rich OG/Twitter metadata:** `layout.tsx` now exports full `Metadata` with title template, description, keywords, `openGraph`, `twitter` card, `robots`, and `metadataBase` (driven by `NEXT_PUBLIC_APP_URL` env var)
- **Cookie-based rate limiting:** Backend uses `Microsoft.AspNetCore.RateLimiting` sliding window (20 req/min per `client_id` cookie). Cookie is `HttpOnly`, `SameSite=None`, `Secure`, 30-day expiry. Returns `429` when exceeded.
- **`credentials: 'include'`** added to all frontend fetch calls so the `client_id` cookie flows cross-origin.

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
