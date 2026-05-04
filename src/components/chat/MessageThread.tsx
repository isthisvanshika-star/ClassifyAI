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
    const container = bottomRef.current?.parentElement;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: messages.length < 5 ? "smooth" : "auto",
    });
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
    <div className="flex-1 flex flex-col overflow-hidden  min-h-0 relative">
      {/* Load more */}
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide px-6 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isOwn = msg.senderId === userId;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex flex-col gap-1 ${
                  isOwn ? "items-end" : "items-start"
                }`}
              >
                {/* Sender */}
                {!isOwn && (
                  <span className="text-xs text-gray-500 px-1">
                    {msg.sender.name}
                  </span>
                )}

                {/* Bubble */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-md ${
                    isOwn
                      ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-sm"
                      : "bg-white/10 text-gray-100 rounded-bl-sm backdrop-blur-md"
                  }`}
                >
                  {msg.decryptedContent ?? (
                    <span className="text-gray-400 italic text-xs">
                      🔒 Encrypted
                    </span>
                  )}
                </motion.div>

                {/* Attachments */}
                {msg.attachments?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {msg.attachments.map((att: any) => (
                      <motion.a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        className="text-xs text-cyan-400 hover:underline bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
                      >
                        📎 {att.title}
                      </motion.a>
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
                        <span className="text-cyan-400">✓✓</span>
                      ) : (
                        <span className="text-gray-500">✓</span>
                      )}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing */}
        {typingUsers.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TypingIndicator typingUsers={typingUsers} />
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error popup */}
      <AnimatePresence>
        {chatError && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50"
          >
            <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl backdrop-blur-xl shadow-xl">
              <span className="text-yellow-400 text-xl shrink-0">🔐</span>

              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-300">
                  Encryption Not Ready
                </p>
                <p className="text-xs text-yellow-200/70 mt-1">{chatError}</p>
              </div>

              <button
                onClick={() => setChatError(null)}
                className="text-yellow-500 hover:text-yellow-300 transition"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <MessageInput
        onSend={sendMessage}
        onTypingStart={sendTypingStart}
        onTypingStop={sendTypingStop}
        userId={userId}
      />
    </div>
  );
}
