"use client";

import { onMessageListener, requestForToken } from "@/utils/fcm";
import { useEffect } from "react";

export default function NotificationHandler({ userId }: { userId: string }) {
  useEffect(() => {
    const setupNotifications = async () => {
      const token = await requestForToken();
      if (token && userId) {
        await fetch("/api/users/update-fcm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, token }),
        });
      }
    };

    if (userId) setupNotifications();

    const unsubscribe = onMessageListener((payload: any) => {
      if (!payload) return;
      const event = new CustomEvent("show-notification", {
        detail: {
          id: Date.now().toString(),
          title: payload?.notification?.title || "New Notification",
          message: payload?.notification?.body || "",
          link: payload?.data?.url || undefined,
        },
      });
      window.dispatchEvent(event);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId]);
  return null;
}
