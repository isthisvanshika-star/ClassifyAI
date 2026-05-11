"use client";

import { useState, useEffect, useCallback, use, useRef } from "react";
import { usePusher } from "./usePusher";
import { encryptMessage, decryptMessage } from "@/lib/crypto";
import { Message, UseChatOptions, ReadReceipt } from "@/lib/types";

export function useChat({
  userId,
  conversationId,
  privateKey,
}: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(
    new Map(),
  );
  const [chatError, setChatError] = useState<string | null>(null);
  const [readByUsers, setReadByUsers] = useState<Record<string, string>>({});
  const [pinnedMessage, setPinnedMessage] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [missedSummary, setMissedSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);

  const participantNamesRef = useRef<Record<string, string>>({});

  //? decrypt a single message....
  const decrypt = useCallback(
    async (msg: Message): Promise<Message> => {
      try {
        const myKey = msg.encryptedKeys?.find(
          (k: any) => k.recipientId === userId,
        );

        const encryptedKey = myKey?.encryptedKey;
        if (!encryptedKey) return { ...msg, decryptedContent: "[encrypted]" };

        const decryptedContent = await decryptMessage(
          msg.encryptedContent,
          encryptedKey,
          privateKey,
        );
        //? decrypt replied message too....
        let decryptedReply = null;
        if (msg.replyTo) {
          try {
            const replyKey = msg.replyTo.encryptedKeys?.find(
              (k: any) => k.recipientId === userId,
            );
            if (replyKey?.encryptedKey) {
              const replyContent = await decryptMessage(
                msg.replyTo.encryptedContent,
                replyKey.encryptedKey,
                privateKey,
              );
              decryptedReply = {
                ...msg.replyTo,
                decryptedContent: replyContent,
              };
            } else {
              decryptedReply = {
                ...msg.replyTo,
                decryptedContent: "[encrypted]",
              };
            }
          } catch (error) {
            decryptedReply = {
              ...msg.replyTo,
              decryptedContent: "[could not decrypt]",
            };
          }
        }
        return { ...msg, decryptedContent, replyTo: decryptedReply };
      } catch {
        return { ...msg, decryptedContent: "[could not decrypt]" };
      }
    },
    [privateKey, userId],
  );

  //? load initial messages....
  const loadMessages = useCallback(
    async (cursor?: string) => {
      setIsLoading(true);
      try {
        const url = `/api/chat/messages?conversationId=${conversationId}&userId=${userId}${
          cursor ? `&cursor=${cursor}` : ""
        }`;
        const res = await fetch(url);
        const data = await res.json();

        const decrypted = await Promise.all(data.messages.map(decrypt));
        if (data.pinnedMessage) {
          const decryptedPinned = await decrypt(data.pinnedMessage);
          setPinnedMessage(decryptedPinned);
        } else {
          setPinnedMessage(null);
        }

        setMessages((prev) => (cursor ? [...decrypted, ...prev] : decrypted));
        setNextCursor(data.nextCursor);
        if (data.pinnedMessage) {
          const decryptedPinned = await decrypt(data.pinnedMessage);
          setPinnedMessage(decryptedPinned);
        } else {
          setPinnedMessage(null);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, userId, decrypt],
  );

  //? send message....
  const sendMessage = useCallback(
    async (
      plainText: string,
      attachmentIds?: string[],
      replyToId?: string | null,
    ) => {
      //? fetch all participant public keys....
      const convRes = await fetch(`/api/chat/conversations?userId=${userId}`);
      const conversations = await convRes.json();
      const conversation = conversations.find(
        (c: any) => c.id === conversationId,
      );
      const recipientPublicKeys = conversation.participants
        .filter((p: any) => p.userId !== userId && p.publicKey)
        .map((p: any) => ({ userId: p.userId, publicKey: p.publicKey }));

      if (recipientPublicKeys.length === 0) {
        setChatError(
          "The other person needs to open the app first to set up encryption keys.",
        );
        return;
      }

      //? also include sender's own public key (so they can decrypt their own messages)....
      const senderParticipant = conversation.participants.find(
        (p: any) => p.userId === userId,
      );
      if (senderParticipant) {
        recipientPublicKeys.push({
          userId,
          publicKey: senderParticipant.publicKey,
        });
      }

      const { encryptedContent, encryptedKeys } = await encryptMessage(
        plainText,
        recipientPublicKeys,
      );

      await fetch(`/api/chat/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          senderId: userId,
          encryptedContent,
          encryptedKeys,
          attachmentIds,
          replyToId: replyToId || null,
        }),
      });
      setReplyingTo(null);
    },
    [userId, conversationId],
  );

  //? pin message....
  const pinMessage = useCallback(
    async (messageId: string) => {
      const res = await fetch("/api/chat/pin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, messageId }),
      });
      if (!res.ok) {
        throw new Error("Failed to pin message");
      }
      const data = await res.json();
      if (data.pinnedMessage) {
        const decrypted = await decrypt(data.pinnedMessage);
        setPinnedMessage(decrypted);
      }
    },
    [conversationId, decrypt],
  );

  //? unpin the pinned message....
  const unpinMessage = useCallback(async () => {
    const res = await fetch("/api/chat/pin", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId,
        messageId: null,
      }),
    });
    if (!res.ok) {
      throw new Error("Failed to unpin");
    }
    setPinnedMessage(null);
  }, [conversationId]);

  //? delete message....
  const deleteMessage = useCallback(
    async (messageId: string) => {
      await fetch(
        `/api/chat/messages?messageId=${messageId}&userId=${userId}&conversationId=${conversationId}`,
        {
          method: "DELETE",
        },
      );
    },
    [conversationId, userId],
  );

  //? edit message....
  const editMessage = useCallback(
    async (messageId: string, plainText: string) => {
      //? get participants....
      const convRes = await fetch(`/api/chat/conversations?userId=${userId}`);
      const conversations = await convRes.json();
      const conversation = conversations.find(
        (c: any) => c.id === conversationId,
      );
      const recipientPublicKeys = conversation.participants
        .filter((p: any) => p.publicKey)
        .map((p: any) => ({
          userId: p.userId,
          publicKey: p.publicKey,
        }));

      const { encryptedContent, encryptedKeys } = await encryptMessage(
        plainText,
        recipientPublicKeys,
      );
      await fetch("/api/chat/messages", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          messageId,
          conversationId,
          userId,
          encryptedContent,
          encryptedKeys,
        }),
      });
    },
    [conversationId, userId],
  );

  const reactToMessage = useCallback(
    async (messageId: string, emoji: string) => {
      const res = await fetch("/api/chat/reactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
          userId,
          emoji,
          conversationId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to react");
      }

      const data = await res.json();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                reactions: Array.isArray(data.reactions)
                  ? data.reactions.filter(Boolean)
                  : [],
              }
            : msg,
        ),
      );
    },
    [conversationId, userId],
  );

  //? ....
  const summarizeMissedMessage = useCallback(async () => {
    if (isSummarizing) return;
    const readableMessages = messages
      .filter((msg) => {
        const text = msg.decryptedContent?.trim();
        return text && text !== "[encrypted]" && text !== "[could not decrypt]";
      })
      .slice(-30)
      .map((msg) => ({
        senderName: msg.sender.name || "Someone",
        content: msg.decryptedContent,
        createdAt: msg.createdAt,
      }));
    if (readableMessages.length === 0) {
      setMissedSummary("No readable recent messages found to summarize.");
      return;
    }
    setIsSummarizing(true);
    try {
      const res = await fetch("/api/chat/ai/missed-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: readableMessages,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Missed summary failed", data.error);
        setMissedSummary("Could not generate summary right now.");
        return;
      }
      setMissedSummary(data.summary || "No important updates found.");
    } catch (error) {
      console.error("Missed summary error:", error);
      setMissedSummary("Could not generate summary right now.");
    } finally {
      setIsSummarizing(false);
    }
  }, [messages, isSummarizing]);

  //? mark conversation as read....
  const markAsRead = useCallback(async () => {
    await fetch(`/api/chat/read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, userId }),
    });
  }, [conversationId, userId]);

  //? load older messages (pagination)....
  const loadMore = useCallback(() => {
    if (nextCursor) loadMessages(nextCursor);
  }, [nextCursor, loadMessages]);

  //? Pusher real-time events....
  const { sendTypingStart, sendTypingStop } = usePusher({
    userId,
    conversationId,
    onNewMessage: async (msg: Message) => {
      const decrypted = await decrypt(msg);
      setMessages((prev) => [...prev, decrypted]);
    },
    onTypingStart: ({ userId: typingId }) => {
      if (typingId === userId) return;
      const name = participantNamesRef.current[typingId] ?? "Someone";
      setTypingUsers((prev) => new Map(prev).set(typingId, name));
    },
    onTypingStop: ({ userId: typingId }) => {
      if (typingId === userId) return;
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(typingId);
        return next;
      });
    },
    onReadReceipt: ({ userId: readerId, readAt }: ReadReceipt) => {
      setReadByUsers((prev) => ({ ...prev, [readerId]: readAt }));
    },

    onPinnedMessageUpdated: async ({ pinnedMessage }) => {
      if (!pinnedMessage) {
        setPinnedMessage(null);
        return;
      }
      const decrypted = await decrypt(pinnedMessage);
      setPinnedMessage(decrypted);
    },

    onReactionUpdated: ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                reactions: Array.isArray(reactions)
                  ? reactions.filter(Boolean)
                  : [],
              }
            : msg,
        ),
      );
    },

    onMessageDeleted: ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    },
    onMessageUpdated: async (msg: Message) => {
      const decrypted = await decrypt(msg);

      setMessages((prev) =>
        prev.map((m) => (m.id === decrypted.id ? decrypted : m)),
      );

      //? also update pinned message if edited....
      setPinnedMessage((prev) =>
        prev?.id === decrypted.id ? decrypted : prev,
      );
    },
  });

  useEffect(() => {
    setMissedSummary(null);
    loadMessages();
    markAsRead();
  }, [conversationId]);

  return {
    messages,
    isLoading,
    typingUsers,
    readByUsers,
    chatError,
    setChatError,
    sendMessage,
    loadMore,
    hasMore: !!nextCursor,
    sendTypingStart,
    sendTypingStop,
    markAsRead,
    pinMessage,
    unpinMessage,
    pinnedMessage,
    replyingTo,
    deleteMessage,
    setReplyingTo,
    editMessage,
    reactToMessage,
    missedSummary,
    setMissedSummary,
    isSummarizing,
    summarizeMissedMessage,
  };
}
