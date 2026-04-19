"use client";

import { useCallback, useRef, useState } from "react";
import { clearSession, streamChat } from "@/lib/api";
import type { AttachedFile, ChatMessage } from "@/types/chat";

function generateId() {
  return crypto.randomUUID();
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const sessionId = useRef<string>(generateId());
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string, attachments: AttachedFile[]) => {
      if (isStreaming || !text.trim()) return;

      // Add user message
      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: text,
        attachments,
        timestamp: new Date(),
      };

      const assistantId = generateId();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        isStreaming: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const files = attachments.map((a) => a.file);
        let accumulated = "";

        for await (const token of streamChat(
          sessionId.current,
          text,
          files,
          controller.signal
        )) {
          accumulated += token;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: accumulated }
                : m
            )
          );
        }

        // Mark streaming done
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m
          )
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content:
                    m.content || "Sorry, an error occurred. Please try again.",
                  isStreaming: false,
                }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearConversation = useCallback(async () => {
    abortRef.current?.abort();
    setMessages([]);
    await clearSession(sessionId.current);
    sessionId.current = generateId();
  }, []);

  return { messages, isStreaming, sendMessage, stopStreaming, clearConversation };
}
