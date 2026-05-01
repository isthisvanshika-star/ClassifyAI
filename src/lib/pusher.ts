import PusherServer from 'pusher';
import PusherClient from "pusher-js";

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(userId: string): PusherClient {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        authEndpoint: "/api/chat/pusher/auth",
        auth: {
          headers: {
            // userId injected at runtime — see usePusher hook
            "x-user-id": userId,
          },
        },
      }
    );
  }
  return pusherClientInstance;
}

export const Channels = {
  // private channel per conversation (DM or group)
  conversation: (id: string) => `private-chat-${id}`,

  // presence channel for group (gives online member list)
  group: (id: string) => `presence-group-${id}`,

  // per-user notification channel
  notifications: (userId: string) => `private-notifications-${userId}`,
};

export const Events = {
  NEW_MESSAGE: "new-message",
  TYPING_START: "client-typing-start",  // client- prefix = no server roundtrip
  TYPING_STOP: "client-typing-stop",
  READ_RECEIPT: "read-receipt",
  NEW_NOTIFICATION: "new-notification",
};
