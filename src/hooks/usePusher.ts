import { useEffect, useRef } from "react";
import { getPusherClient, Channels, Events } from "@/lib/pusher";
import type { Channel } from "pusher-js";

interface UsePusherOptions {
  userId: string;
  conversationId: string;
  onNewMessage: (message: any) => void;
  onTypingStart?: (data: { userId: string }) => void;
  onTypingStop?: (data: { userId: string }) => void;
  onReadReceipt?: (data: { userId: string; readAt: string }) => void;
  onPinnedMessageUpdated?: (data: { pinnedMessage: any | null }) => void;
}

export function usePusher({
  userId,
  conversationId,
  onNewMessage,
  onTypingStart,
  onTypingStop,
  onReadReceipt,
  onPinnedMessageUpdated
}: UsePusherOptions) {
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!userId || !conversationId || userId.trim() === "") return;

    const pusher = getPusherClient(userId);
    const channelName = Channels.conversation(conversationId);
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    channel.bind("pusher:subscription_error", (err: any) => {
      console.error("Subscription error:", err); // ← add
    });

    channel.bind(Events.NEW_MESSAGE, onNewMessage);
    if (onTypingStart) channel.bind(Events.TYPING_START, onTypingStart);
    if (onTypingStop) channel.bind(Events.TYPING_STOP, onTypingStop);
    if (onReadReceipt) channel.bind(Events.READ_RECEIPT, onReadReceipt);
    if(onPinnedMessageUpdated) channel.bind(Events.PINNED_MESSAGE_UPDATED, onPinnedMessageUpdated)

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [userId, conversationId]);

  //? trigger typing events directly from client (no server roundtrip)....
  const sendTypingStart = () => {
    if (!conversationId || !userId) return;
    fetch("/api/chat/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, userId, isTyping: true }),
    });
  };

  const sendTypingStop = () => {
    if (!conversationId || !userId) return;
    fetch("/api/chat/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, userId, isTyping: false }),
    });
  };

  return { sendTypingStart, sendTypingStop };
}
