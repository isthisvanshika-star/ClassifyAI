"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Paperclip, X } from "lucide-react";

interface MessageInputProps {
  onSend: (text: string, attachmentIds?: string[]) => Promise<void>;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

export default function MessageInput({
  onSend,
  onTypingStart,
  onTypingStop,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<
    { id: string; name: string }[]
  >([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // typing indicator logic with debounce
  const handleTyping = useCallback(
    (value: string) => {
      setText(value);

      if (!isTypingRef.current) {
        isTypingRef.current = true;
        onTypingStart();
      }

      // stop typing after 2s of inactivity
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        onTypingStop();
      }, 2000);
    },
    [onTypingStart, onTypingStop],
  );

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;

    setIsSending(true);

    // stop typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    isTypingRef.current = false;
    onTypingStop();

    try {
      await onSend(
        trimmed,
        attachments.map((a) => a.id),
      );
      setText("");
      setAttachments([]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Cloudinary upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!,
    );

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
        { method: "POST", body: formData },
      );
      const data = await res.json();

      // save as Resource in DB
      const resourceRes = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: file.name,
          url: data.secure_url,
          fileExtension: file.name.split(".").pop(),
          resourceType: "NOTES",
        }),
      });
      const resource = await resourceRes.json();
      setAttachments((prev) => [...prev, { id: resource.id, name: file.name }]);
    } catch (err) {
      console.error("Upload failed:", err);
    }

    // reset input
    e.target.value = "";
  };

  return (
    <div className="border-t border-white/10 p-4 bg-white/5 backdrop-blur-lg">
      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-xs text-gray-300 border border-white/10"
            >
              <span>📎 {att.name}</span>
              <button
                onClick={() =>
                  setAttachments((prev) => prev.filter((a) => a.id !== att.id))
                }
                className="text-gray-500 hover:text-red-400 transition"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-3">
        {/* File upload */}
        <label className="shrink-0 cursor-pointer p-2 rounded-full hover:bg-white/10 transition text-gray-400 hover:text-gray-200">
          <Paperclip size={20} />
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
          />
        </label>

        {/* Text area */}
        <textarea
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Enter to send)"
          rows={1}
          className="flex-1 resize-none bg-neutral-900/70 border border-gray-700/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition max-h-32 overflow-y-auto scrollbar-hide"
          style={{ minHeight: "42px" }}
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={isSending || (!text.trim() && attachments.length === 0)}
          className="shrink-0 p-2.5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg"
        >
          <Send size={18} className="text-white" />
        </button>
      </div>
    </div>
  );
}
