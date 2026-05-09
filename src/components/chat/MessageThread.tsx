"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { formatDistanceToNow } from "date-fns";
import { secureGet } from "@/lib/tauri-store";
import { AnimatePresence, motion } from "framer-motion";
import { Pin, X, Reply, Trash2, Check, Pencil, Smile } from "lucide-react";

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
  const reactionPickerRef = useRef<HTMLDivElement | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [reactionPickerFor, setReactionPickerFor] = useState<string | null>(
    null,
  );
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
    pinMessage,
    pinnedMessage,
    unpinMessage,
    replyingTo,
    setReplyingTo,
    deleteMessage,
    editMessage,
    reactToMessage,
  } = useChat({ userId, conversationId, privateKey });

  useEffect(() => {
    const registerKey = async () => {
      const publicKey = await secureGet(`publicKey_${userId}`);
      if (!publicKey) return;

      await fetch("/api/chat/keys", {
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
    const handleClickOutside = (event: MouseEvent) => {
      if (
        reactionPickerRef.current &&
        !reactionPickerRef.current.contains(event.target as Node)
      ) {
        setReactionPickerFor(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    markAsRead();
  }, [conversationId]);

  const startEditing = (msg: any) => {
    setEditingId(msg.id);
    setEditText(msg.decryptedContent || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async () => {
    if (!editingId || !editText.trim()) return;

    await editMessage(editingId, editText);

    cancelEditing();
  };

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
      {pinnedMessage && (
        <motion.div
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mx-4 mt-3 flex items-center gap-3 rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-amber-500/5 px-4 py-3 backdrop-blur-xl shadow-lg"
        >
          {/* Pin Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-500/15 text-yellow-400">
            <Pin size={18} />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-yellow-300/80">
              Pinned Message
            </p>

            <p className="mt-0.5 truncate text-sm text-white/90">
              {pinnedMessage.decryptedContent}
            </p>
          </div>

          {/* Close */}
          <button
            onClick={unpinMessage}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <X size={15} />
          </button>
        </motion.div>
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
                className={` flex flex-col gap-1 ${
                  isOwn ? "items-end" : "items-start"
                }`}
              >
                {/* Sender */}
                {!isOwn && (
                  <span className="text-xs text-gray-500 px-1">
                    {msg.sender.name}
                  </span>
                )}
                <div className="group relative flex max-w-[85%] items-center overflow-visible">
                  {/* Bubble */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className={` w-fit max-w-full break-words px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-md ${
                      isOwn
                        ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-sm"
                        : "bg-white/10 text-gray-100 rounded-bl-sm backdrop-blur-md"
                    }`}
                  >
                    {msg.replyTo && (
                      <div
                        className={`mb-2 rounded-xl border-l-2 px-3 py-2 text-xs ${
                          isOwn
                            ? "border-white/40 bg-white/10"
                            : "border-cyan-400/50 bg-black/20"
                        }`}
                      >
                        <p className="font-semibold text-cyan-300">
                          {msg.replyTo.sender?.name}
                        </p>

                        <p className="truncate text-white/70">
                          {msg.replyTo.decryptedContent}
                        </p>
                      </div>
                    )}
                    {editingId === msg.id ? (
                      <div className="flex flex-col gap-2 min-w-[220px]">
                        {" "}
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="resize-none rounded-xl bg-black/20 px-3 py-2 text-sm outline-none border border-white/10"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={cancelEditing}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 hover:bg-red-500/20 transition"
                          >
                            <X size={14} />
                          </button>

                          <button
                            onClick={saveEdit}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 transition"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {msg.decryptedContent ?? (
                          <span className="text-gray-400 italic text-xs">
                            Encrypted message
                          </span>
                        )}
                      </>
                    )}
                  </motion.div>
                  <div
                    className={`absolute top-1/2 z-30 flex -translate-y-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/70 px-2 py-1 shadow-xl backdrop-blur-xl opacity-0 scale-95 transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 ${
                      isOwn
                        ? "-left-3 -translate-x-full"
                        : "-right-3 translate-x-full"
                    }`}
                  >
                    {/* React */}
                    <button
                      type="button"
                      title="React"
                      onClick={() =>
                        setReactionPickerFor((prev) =>
                          prev === msg.id ? null : msg.id,
                        )
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-orange-500/15 hover:text-orange-300"
                    >
                      <Smile size={14} />
                    </button>

                    {/* Reply */}
                    <button
                      type="button"
                      title="Reply"
                      onClick={() => setReplyingTo(msg)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-cyan-500/15 hover:text-cyan-300"
                    >
                      <Reply size={14} />
                    </button>

                    {/* Pin */}
                    <button
                      type="button"
                      title="Pin"
                      onClick={() => pinMessage(msg.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-yellow-500/15 hover:text-yellow-300"
                    >
                      <Pin size={14} />
                    </button>

                    {/* Edit + Delete only for own messages */}
                    {isOwn && (
                      <>
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => startEditing(msg)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-pink-500/15 hover:text-pink-300"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          type="button"
                          title="Delete"
                          onClick={() => deleteMessage(msg.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-500/15 hover:text-red-300"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Reaction Picker */}
                  {reactionPickerFor === msg.id && (
                    <div
                      ref={reactionPickerRef}
                      className={`absolute bottom-12 z-50 ${
                        isOwn ? "right-full mr-3" : "left-full ml-3"
                      }`}
                    >
                      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-2xl backdrop-blur-xl">
                        <EmojiPicker
                          onEmojiClick={(emojiData) => {
                            reactToMessage(msg.id, emojiData.emoji);
                            setReactionPickerFor(null);
                          }}
                          theme={Theme.DARK}
                          width={280}
                          height={350}
                          autoFocusSearch={false}
                        />
                      </div>
                    </div>
                  )}
                </div>

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

                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {Object.entries(
                      msg.reactions.reduce((acc: any, reaction: any) => {
                        if (!reaction?.emoji) return acc;
                        if (!acc[reaction.emoji]) {
                          acc[reaction.emoji] = {
                            count: 0,
                            reacted: false,
                          };
                        }

                        acc[reaction.emoji].count++;
                        if (reaction.userId === userId) {
                          acc[reaction.emoji].reacted = true;
                        }
                        return acc;
                      }, {}),
                    ).map(([emoji, data]: any) => (
                      <button
                        key={emoji}
                        onClick={() => reactToMessage(msg.id, emoji)}
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border transition ${
                          data.reacted
                            ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-200"
                            : "bg-white/10 border-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        <span>{emoji}</span>
                        <span>{data.count}</span>
                      </button>
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
                  {msg.editedAt && (
                    <span className="text-[10px] italic text-gray-500">
                      edited
                    </span>
                  )}
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

      {replyingTo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mx-4 mb-2 flex items-start gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 backdrop-blur-xl"
        >
          <div className="mt-1 h-10 w-1 rounded-full bg-cyan-400" />

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-cyan-300">
              Replying to {replyingTo.sender?.name || "message"}
            </p>

            <p className="truncate text-sm text-white/80">
              {replyingTo.decryptedContent}
            </p>
          </div>

          <button
            onClick={() => setReplyingTo(null)}
            className="text-gray-400 hover:text-red-400 transition"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
      {/* Input */}
      <MessageInput
        onSend={(text, attachments) =>
          sendMessage(text, attachments, replyingTo?.id)
        }
        onTypingStart={sendTypingStart}
        onTypingStop={sendTypingStop}
        userId={userId}
      />
    </div>
  );
}
