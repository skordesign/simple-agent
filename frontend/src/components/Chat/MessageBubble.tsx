"use client";

import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "@/types/chat";
import { TypingIndicator } from "./TypingIndicator";
import { FileText, Image as ImageIcon } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full mb-4 ${isUser ? "justify-end" : "justify-start"}`}
      style={{ animation: "fade-up 0.35s ease-out forwards" }}
    >
      {/* AI avatar */}
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full mr-3 mt-1 flex items-center justify-center"
          style={{
            background: "radial-gradient(circle at 35% 35%, #c7d2fe, #6366f1 80%)",
          }}
        >
          <span className="text-white text-xs font-bold">AI</span>
        </div>
      )}

      <div className={`max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {/* Attachments */}
        {isUser && message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-end mb-1">
            {message.attachments.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1.5 text-xs text-indigo-700"
              >
                {f.type.startsWith("image/") ? (
                  <ImageIcon size={12} />
                ) : (
                  <FileText size={12} />
                )}
                <span className="max-w-30 truncate">{f.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Message bubble */}
        {isUser ? (
          <div className="bg-accent text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">
            {message.content}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed shadow-sm min-w-15">
            {message.isStreaming && message.content === "" ? (
              <TypingIndicator />
            ) : (
              <div className="prose-ai text-gray-800">
                <ReactMarkdown>{message.content}</ReactMarkdown>
                {message.isStreaming && (
                  <span
                    className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 align-middle"
                    style={{ animation: "stream-cursor 0.8s step-end infinite" }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-gray-400 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}
