export type MessageRole = "user" | "assistant";

export interface AttachedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  attachments?: AttachedFile[];
  isStreaming?: boolean;
  timestamp: Date;
}
