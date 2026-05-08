"use client";

import { useState, useEffect, useCallback, use, useRef } from "react";
import { usePusher } from "./usePusher";
import { encryptMessage, decryptMessage } from "@/lib/crypto";
import { Message, UseChatOptions, ReadReceipt } from "@/lib/types";
import { set } from "date-fns";

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
        return { ...msg, decryptedContent };
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
        }),
      });
    },
    [userId, conversationId],
  );

  //?
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
  });

  useEffect(() => {
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
  };
}
