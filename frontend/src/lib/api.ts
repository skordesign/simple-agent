const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export async function* streamChat(
  sessionId: string,
  message: string,
  files: File[],
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  const form = new FormData();
  form.append("message", message);
  for (const file of files) {
    form.append("files", file);
  }

  const response = await fetch(`${API_BASE}/api/chat/stream`, {
    method: "POST",
    headers: { "X-Session-Id": sessionId },
    body: form,
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") return;

        try {
          const parsed = JSON.parse(raw);
          if (parsed.error) throw new Error(parsed.error);
          if (typeof parsed.token === "string") yield parsed.token;
        } catch {
          // Malformed SSE line — skip
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function clearSession(sessionId: string): Promise<void> {
  await fetch(`${API_BASE}/api/chat/session`, {
    method: "DELETE",
    headers: { "X-Session-Id": sessionId },
    credentials: "include",
  });
}
