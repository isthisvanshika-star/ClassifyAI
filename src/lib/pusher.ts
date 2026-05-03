import PusherServer from "pusher";
import PusherClient from "pusher-js";

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

let pusherClientInstance: PusherClient | null = null;
//? track who the instance belongs to....
let currentUserId: string | null = null;

export function getPusherClient(userId: string): PusherClient {
  //? if userid changed or no instance exists, create fresh....
  if (pusherClientInstance && currentUserId == userId) {
    return pusherClientInstance;
  }

  //? disconnect old instance if exists....
  if (pusherClientInstance) {
    pusherClientInstance.disconnect();
    pusherClientInstance = null;
  }

  currentUserId = userId;

  pusherClientInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: "/api/chat/pusher/auth",
    auth: {
      headers: {
        "x-user-id": userId,
      },
    },
  });
  return pusherClientInstance;
}

export function resetPusherClient() {
  if (pusherClientInstance) {
    pusherClientInstance.disconnect();
    pusherClientInstance = null;
    currentUserId = null;
  }
}

export const Channels = {
  //? private channel per conversation (DM or group)....
  conversation: (id: string) => `private-chat-${id}`,

  //? presence channel for group (gives online member list)....
  group: (id: string) => `presence-group-${id}`,

  //? per-user notification channel....
  notifications: (userId: string) => `private-notifications-${userId}`,
};

export const Events = {
  NEW_MESSAGE: "new-message",
  TYPING_START: "typing-start",
  TYPING_STOP: "typing-stop",
  READ_RECEIPT: "read-receipt",
  NEW_NOTIFICATION: "new-notification",
};
