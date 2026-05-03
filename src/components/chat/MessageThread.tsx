"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import { generateKeyPair } from "@/lib/crypto";
import { formatDistanceToNow } from "date-fns";
import { secureGet, secureSet } from "@/lib/tauri-store";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface MessageThreadProps {
  userId: string;
  conversationId: string;
  privateKey: string;
}

export default function MessageThread({
  userId,
  conversationId,
  privateKey,
}: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    typingUsers,
    readByUsers,
    chatError,
    setChatError,
    sendMessage,
    loadMore,
    hasMore,
    sendTypingStart,
    sendTypingStop,
    markAsRead,
  } = useChat({ userId, conversationId, privateKey });

  useEffect(() => {
    const registerKey = async () => {
      const existingPublicKey = await secureGet(`publicKey_${userId}`);
      if (existingPublicKey) return;

      const { publicKey, privateKey: newPrivateKey } = await generateKeyPair();

      await secureSet(`privateKey_${userId}`, newPrivateKey);
      await secureSet(`publicKey_${userId}`, publicKey);

      await fetch("/api/chat/keys/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, conversationId, publicKey }),
      });
    };

    registerKey();
  }, [userId, conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    markAsRead();
  }, [conversationId]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {hasMore && (
        <div className="flex justify-center py-2 border-b border-white/10">
          <button
            onClick={loadMore}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            Load older messages
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4 space-y-3">
        {messages.map((msg) => {
          const isOwn = msg.senderId === userId;
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}
            >
              {/* Sender name (only in group chats) */}
              {!isOwn && (
                <span className="text-xs text-gray-500 px-1">
                  {msg.sender.name}
                </span>
              )}

              <div
                className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isOwn
                    ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-sm"
                    : "bg-white/10 text-gray-100 rounded-bl-sm"
                }`}
              >
                {msg.decryptedContent ?? (
                  <span className="text-gray-400 italic text-xs">
                    🔒 Encrypted
                  </span>
                )}
              </div>

              {msg.attachments?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {msg.attachments.map((att: any) => (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:underline bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
                    >
                      📎 {att.title}
                    </a>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <div className="flex items-center gap-1 px-1">
                <span className="text-[10px] text-gray-600">
                  {formatDistanceToNow(new Date(msg.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {isOwn && (
                  <span className="text-[10px]">
                    {Object.entries(readByUsers).some(
                      ([readerId]) => readerId !== userId,
                    ) ? (
                      <span className="text-cyan-400" title="Read">
                        ✓✓
                      </span>
                    ) : (
                      <span className="text-gray-500" title="Sent">
                        ✓
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typingUsers.size > 0 && <TypingIndicator typingUsers={typingUsers} />}

        <div ref={bottomRef} />
      </div>
      {/* Encryption error popup */}
      <AnimatePresence>
        {chatError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50"
          >
            <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl backdrop-blur-lg shadow-xl">
              <span className="text-yellow-400 text-xl shrink-0">🔐</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-300">
                  Encryption Not Ready
                </p>
                <p className="text-xs text-yellow-200/70 mt-1">{chatError}</p>
              </div>
              <button
                onClick={() => setChatError(null)}
                className="text-yellow-500 hover:text-yellow-300 transition shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input ── */}
      <MessageInput
        onSend={sendMessage}
        onTypingStart={sendTypingStart}
        onTypingStop={sendTypingStop}
        userId={userId}
      />
    </div>
  );
}
