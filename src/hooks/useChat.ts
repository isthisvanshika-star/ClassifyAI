"use client";

import { useState, useEffect, useCallback } from "react";
import { usePusher } from "./usePusher";
import { encryptMessage, decryptMessage } from "@/lib/crypto";
import { Message, UseChatOptions } from "@/lib/types";

export function useChat({
  userId,
  conversationId,
  privateKey,
}: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  //? decrypt a single message....
  const decrypt = useCallback(
    async (msg: Message): Promise<Message> => {
      try {
        const encryptedKey = msg.encryptedKeys?.[0]?.encryptedKey;
        if (!encryptedKey) return { ...msg, decryptedContent: "[encrypted]" };

        const decryptedContent = await decryptMessage(
          msg.encryptedContent,
          encryptedKey,
          privateKey,
        );
        return { ...msg, decryptedContent };
      } catch {
        return { ...msg, decryptedContent: "[could not decrypt]" };
      }
    },
    [privateKey],
  );

  //? load initial messages....
  const loadMessages = useCallback(
    async (cursor?: string) => {
      setIsLoading(true);
      try {
        const url = `/api/chat/conversations/${conversationId}/messages?userId=${userId}${
          cursor ? `&cursor=${cursor}` : ""
        }`;
        const res = await fetch(url);
        const data = await res.json();

        const decrypted = await Promise.all(data.messages.map(decrypt));

        setMessages((prev) => (cursor ? [...decrypted, ...prev] : decrypted));
        setNextCursor(data.nextCursor);
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, userId, decrypt],
  );

  //? send message....
  const sendMessage = useCallback(
    async (plainText: string, attachmentIds?: string[]) => {
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
        throw new Error(
          "Recipient hasn't set up their keys yet. Try again later.",
        );
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

      await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: userId,
          encryptedContent,
          encryptedKeys,
          attachmentIds,
        }),
      });
    },
    [userId, conversationId],
  );

  //? mark conversation as read....
  const markAsRead = useCallback(async () => {
    await fetch(`/api/chat/conversations/${conversationId}/read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
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
      setTypingUsers((prev) => new Set(prev).add(typingId));
    },
    onTypingStop: ({ userId: typingId }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(typingId);
        return next;
      });
    },
  });

  useEffect(() => {
    loadMessages();
    markAsRead();
  }, [conversationId]);

  return {
    messages,
    isLoading,
    typingUsers,
    sendMessage,
    loadMore,
    hasMore: !!nextCursor,
    sendTypingStart,
    sendTypingStop,
    markAsRead,
  };
}
