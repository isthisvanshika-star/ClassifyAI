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
}

export function usePusher({
  userId,
  conversationId,
  onNewMessage,
  onTypingStart,
  onTypingStop,
  onReadReceipt,
}: UsePusherOptions) {
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!userId || !conversationId) return;

    const pusher = getPusherClient(userId);
    const channelName = Channels.conversation(conversationId);
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    channel.bind(Events.NEW_MESSAGE, onNewMessage);
    if (onTypingStart) channel.bind(Events.TYPING_START, onTypingStart);
    if (onTypingStop) channel.bind(Events.TYPING_STOP, onTypingStop);
    if (onReadReceipt) channel.bind(Events.READ_RECEIPT, onReadReceipt);

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [userId, conversationId]);

  //? trigger typing events directly from client (no server roundtrip)....
  const sendTypingStart = () => {
    channelRef.current?.trigger(Events.TYPING_START, { userId });
  };

  const sendTypingStop = () => {
    channelRef.current?.trigger(Events.TYPING_STOP, { userId });
  };

  return { sendTypingStart, sendTypingStop };
}
