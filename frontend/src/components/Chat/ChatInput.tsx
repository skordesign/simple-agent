"use client";

import {
  KeyboardEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  Paperclip,
  Send,
  Square,
  X,
  FileText,
  Image as ImageIcon,
  Lightbulb,
  Microscope,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { AttachedFile } from "@/types/chat";

interface ChatInputProps {
  onSend: (message: string, attachments: AttachedFile[]) => void;
  onStop: () => void;
  onClear: () => void;
  isStreaming: boolean;
  hasMessages: boolean;
}

const ALLOWED_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/xml",
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACTION_CHIPS = [
  { label: "Reasoning", icon: Lightbulb },
  { label: "Analyze File", icon: Microscope },
  { label: "Summarize", icon: Sparkles },
];

export function ChatInput({
  onSend,
  onStop,
  onClear,
  isStreaming,
  hasMessages,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    const valid: AttachedFile[] = [];
    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE) continue;
      valid.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        file,
      });
    }
    setAttachments((prev) => [...prev, ...valid]);
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleSend = useCallback(() => {
    if (isStreaming) { onStop(); return; }
    if (!text.trim() && attachments.length === 0) return;
    onSend(text.trim(), attachments);
    setText("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [isStreaming, text, attachments, onSend, onStop]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      // Auto-resize
      e.target.style.height = "auto";
      e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const canSend = (text.trim().length > 0 || attachments.length > 0) && !isStreaming;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6">
      <div
        className={`relative bg-white rounded-2xl shadow-md border transition-all duration-200 ${
          dragOver
            ? "border-indigo-400 ring-2 ring-indigo-200"
            : "border-gray-200 hover:border-gray-300"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {/* Attachment pills */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-4 pt-3">
            {attachments.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1 text-xs text-indigo-700 max-w-[180px]"
              >
                {f.type.startsWith("image/") ? (
                  <ImageIcon size={11} />
                ) : (
                  <FileText size={11} />
                )}
                <span className="truncate">{f.name}</span>
                <button
                  onClick={() => removeAttachment(f.id)}
                  className="ml-0.5 text-indigo-400 hover:text-indigo-700 flex-shrink-0"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <div className="px-4 pt-3 pb-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="✦ Initiate a query or send a command to the AI..."
            rows={1}
            className="w-full resize-none bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none leading-relaxed"
            style={{ minHeight: "40px", maxHeight: "200px" }}
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 pb-3 gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* File attach */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
              title="Attach file"
            >
              <Paperclip size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.md,.csv,.json,.xml,.pdf,.jpg,.jpeg,.png,.gif,.webp"
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />

            {/* Action chips */}
            {ACTION_CHIPS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 transition-all"
                onClick={() => setText((t) => (t ? `${t} ${label.toLowerCase()}` : label.toLowerCase()))}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}

            {/* Clear button */}
            {hasMessages && (
              <button
                onClick={onClear}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-all"
                title="Clear conversation"
              >
                <Trash2 size={12} />
                Clear
              </button>
            )}
          </div>

          {/* Send / Stop button */}
          <button
            onClick={handleSend}
            disabled={!canSend && !isStreaming}
            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
              isStreaming
                ? "bg-red-500 hover:bg-red-600 text-white"
                : canSend
                ? "bg-[var(--accent)] hover:bg-indigo-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            {isStreaming ? <Square size={14} fill="white" /> : <Send size={14} />}
          </button>
        </div>
      </div>

      <p className="text-center text-[11px] text-gray-400 mt-2">
        AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}
