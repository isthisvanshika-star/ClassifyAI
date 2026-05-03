"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { Bell, CheckCheck } from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import toast from "react-hot-toast";
import { showNotification } from "@/lib/helper";
import { getPusherClient, Channels, Events } from "@/lib/pusher";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);
  //*(A. Vanshika) Storing exact milisectond time when the component is mounted.....
  const mountTime = useRef<number>(Date.now());
  const prevUnreadCount = useRef<number>(0);
  const shownNotifications = useRef<Set<string>>(new Set());
  const bellControls = useAnimation();

  useEffect(() => {
    setStudentId(localStorage.getItem("studentId"));
  }, []);

  const { data, error, mutate } = useSWR(
    studentId ? `/api/student/notifications?studentId=${studentId}` : null,
    fetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: true,
    },
  );

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;
  useEffect(() => {
    if (unreadCount > prevUnreadCount.current) {
      bellControls.start({
        rotate: [0, -15, 15, -10, 10, -5, 5, 0],
        transition: { duration: 0.7, ease: "easeInOut" },
      });
      const audio = new Audio("/ClassifyAI-notification.mp3");
      audio.volume = 0.4;
      audio.play().catch(() => {});
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount, bellControls]);

  useEffect(() => {
    if (!studentId) return;
    const pusher = getPusherClient(studentId);
    const channel = pusher.subscribe(Channels.notifications(studentId));
    channel.bind(Events.NEW_NOTIFICATION, () => {
      //*(A. Vanshika)  trigger SWR revalidation — picks up new notification from DB.....
      mutate(`/api/student/notifications?studentId=${studentId}`);
    });
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(Channels.notifications(studentId));
    };
  }, [studentId]);

  useEffect(() => {
    if (!notifications.length) return;

    notifications.forEach((n: any) => {
      //* (A. Vanshika) Taking the time where notification was genrated.....
      const notifTime = new Date(n.createdAt).getTime();

      //* (A. Vanshika) Showing only those notification that were genrated after the page loads.....
      if (
        notifTime > mountTime.current &&
        !shownNotifications.current.has(n.id)
      ) {
        shownNotifications.current.add(n.id);
        showNotification({
          id: n.id,
          title: n.title,
          message: n.body,
          link: n.meta?.link,
        });
      }
    });
  }, [notifications]);
  const handleToggle = async () => {
    const currentlyOpening = !isOpen;
    setIsOpen(currentlyOpening);

    if (currentlyOpening && unreadCount > 0 && studentId) {
      const unreadIds = notifications
        .filter((n: any) => !n.read)
        .map((n: any) => n.id);
      if (unreadIds.length === 0) return;

      mutate({ ...data, unreadCount: 0 }, false);

      try {
        await fetch("/api/student/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, notificationIds: unreadIds }),
        });
        mutate();
      } catch {
        toast.error("Couldn't mark notifications as read.");
      }
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={handleToggle}
        className="relative p-2  rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 backdrop-blur-md"
        animate={bellControls}
      >
        <Bell className="text-cyan-400" size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 2xl:-right-[2rem] w-80 sm:w-96 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="flex justify-between items-center p-4 font-semibold text-cyan-300 border-b border-white/10">
              <span>Notifications</span>
              {unreadCount === 0 && (
                <CheckCheck size={18} className="text-green-400">
                  <title>All caught up!</title>
                </CheckCheck>
              )}
            </div>
            <ul className="max-h-96 overflow-y-auto text-gray-200">
              {error && (
                <li className="p-4 text-sm text-red-400">
                  Failed to load notifications.
                </li>
              )}
              {!error && notifications.length > 0 ? (
                [...notifications]
                  .sort(
                    (a: any, b: any) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .slice(0, 3)
                  .map((n: any) => (
                    <li
                      key={n.id}
                      className={`p-4 border-b scrollbar-hide border-white/10 hover:bg-white/10 transition-colors ${
                        !n.read ? "bg-cyan-900/30" : ""
                      }`}
                    >
                      <p className="font-medium text-white">{n.title}</p>
                      <p className="text-sm text-gray-400 mt-1">{n.body}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))
              ) : (
                <p className="p-4 text-sm text-center text-gray-500">
                  You have no new notifications.
                </p>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
