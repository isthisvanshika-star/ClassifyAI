"use client";

import { useState, useRef, useCallback } from "react";
import { Send, Paperclip, X, Smile, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { EMOJI_SHORTCUTS } from "@/lib/helper";

interface MessageInputProps {
  onSend: (text: string, attachmentIds?: string[]) => Promise<void>;
  onTypingStart: () => void;
  onTypingStop: () => void;
  userId: string;
}

function replaceEmojiShortcuts(value: string) {
  return value.replace(/:([a-zA-Z0-9_+-]+):/g, (match, shortcut) => {
    const emoji = EMOJI_SHORTCUTS[shortcut.toLowerCase()];
    return emoji ?? match;
  });
}

export default function MessageInput({
  onSend,
  onTypingStart,
  onTypingStop,
  userId,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<
    { id: string; name: string }[]
  >([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [isImproving, setIsImproving] = useState<boolean>(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const handleTyping = useCallback(
    (value: string) => {
      const parsedValue = replaceEmojiShortcuts(value);
      setText(parsedValue);

      if (!isTypingRef.current) {
        isTypingRef.current = true;
        onTypingStart();
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        onTypingStop();
      }, 2000);
    },
    [onTypingStart, onTypingStop],
  );

  const handleEmojiClick = (emojiData: any) => {
    setText((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleImproveWithAI = async () => {
    const trimmed = text.trim();

    if (!trimmed || isImproving) return;

    setIsImproving(true);

    try {
      const res = await fetch("/api/chat/ai/improve-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: trimmed,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Improve failed:", data.error);
        return;
      }

      if (data.improved) {
        setText(data.improved);
      }
    } catch (error) {
      console.error("Improve with AI error:", error);
    } finally {
      setIsImproving(false);
    }
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;

    setIsSending(true);

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
    } catch (error: any) {
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

      const resourceRes = await fetch("/api/chat/attachments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: file.name,
          url: data.secure_url,
          fileExtension: file.name.split(".").pop(),
          uploadedBy: userId,
        }),
      });
      const resource = await resourceRes.json();
      setAttachments((prev) => [...prev, { id: resource.id, name: file.name }]);
    } catch (err) {
      console.error("Upload failed:", err);
    }

    e.target.value = "";
  };

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="border-t border-white/10 p-4 bg-white/5 backdrop-blur-xl"
    >
      {/* Attachments */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-wrap gap-2 mb-3"
          >
            {attachments.map((att) => (
              <motion.div
                key={att.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-xs text-gray-300 border border-white/10"
              >
                <span>📎 {att.name}</span>
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() =>
                    setAttachments((prev) =>
                      prev.filter((a) => a.id !== att.id),
                    )
                  }
                  className="text-gray-500 hover:text-red-400 transition"
                >
                  <X size={12} />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input row */}
      <div className="flex items-end gap-3">
        {/* Upload */}
        <motion.label
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="shrink-0 cursor-pointer p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition"
        >
          <Paperclip size={18} />
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
          />
        </motion.label>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            rows={1}
            className="w-full resize-none bg-neutral-900/70 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition max-h-32 overflow-y-auto scrollbar-hide"
            style={{ minHeight: "42px" }}
          />

          {/* subtle glow on focus */}
          <div className="pointer-events-none absolute inset-0 rounded-xl border border-transparent focus-within:border-indigo-500/30" />
        </div>
        <div className="relative shrink-0">
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-yellow-400 transition"
          >
            <Smile size={18} />
          </motion.div>
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-14 right-0 z-50"
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme={Theme.DARK}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Improve with AI */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={handleImproveWithAI}
          disabled={isImproving || !text.trim()}
          title="Improve with AI"
          className="shrink-0 p-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {isImproving ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="block h-[18px] w-[18px] border-2 border-cyan-400 border-t-transparent rounded-full"
            />
          ) : (
            <>
            <Sparkles size={18} />
            </>
          )}
        </motion.button>
        {/* Send */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          disabled={isSending || (!text.trim() && attachments.length === 0)}
          className="shrink-0 p-2.5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg"
        >
          <Send size={18} className="text-white" />
        </motion.button>
      </div>
    </motion.div>
  );
}
