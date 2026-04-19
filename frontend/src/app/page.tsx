"use client";

import { useChat } from "@/hooks/useChat";
import { OrbAnimation } from "@/components/ui/OrbAnimation";
import { GreetingHeader } from "@/components/ui/GreetingHeader";
import { ChatMessages } from "@/components/Chat/ChatMessages";
import { ChatInput } from "@/components/Chat/ChatInput";

export default function Home() {
  const { messages, isStreaming, sendMessage, stopStreaming, clearConversation } =
    useChat();

  const hasMessages = messages.length > 0;

  return (
    <div
      className="flex flex-col h-dvh overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #eef0fb 0%, #f5f5ff 40%, #eff1fc 100%)",
      }}
    >
      {/* Header / Hero — shrinks when chat starts */}
      <div
        className={`flex flex-col items-center justify-end transition-all duration-500 ease-out shrink-0 ${
          hasMessages ? "pt-6 pb-4" : "flex-1 pb-8"
        }`}
      >
        <div
          className={`transition-all duration-500 ${
            hasMessages ? "scale-75 opacity-80" : "scale-100 opacity-100"
          }`}
        >
          <OrbAnimation />
        </div>

        <div
          className={`transition-all duration-500 ${
            hasMessages ? "scale-90 opacity-0 h-0 overflow-hidden" : "scale-100 opacity-100"
          }`}
        >
          <GreetingHeader name={process.env.NEXT_PUBLIC_GREETING_NAME ?? "there"} />
        </div>
      </div>

      {/* Message list — scrollable */}
      {hasMessages && (
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <ChatMessages messages={messages} />
        </div>
      )}

      {/* Input — always at bottom */}
      <div className="shrink-0">
        <ChatInput
          onSend={sendMessage}
          onStop={stopStreaming}
          onClear={clearConversation}
          isStreaming={isStreaming}
          hasMessages={hasMessages}
        />
      </div>
    </div>
  );
}
