"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";

interface Toast {
  id: string;
  title: string;
  message: string;
  link?: string;
}

export default function NotificationPortal() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleNewToast = (event: CustomEvent<Toast>) => {
      const toast = event.detail;
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 5000);
    };

    window.addEventListener("show-notification", handleNewToast as EventListener);
    return () =>
      window.removeEventListener("show-notification", handleNewToast as EventListener);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[9999]">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative group overflow-hidden p-[1px] rounded-2xl bg-gradient-to-r from-cyan-500/50 via-purple-600/40 to-cyan-500/50 shadow-[0_0_15px_rgba(0,255,255,0.3)]"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-start gap-3 p-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 text-white"
            >
              <motion.div
                initial={{ rotate: -20 }}
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <Bell
                  className="text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)] group-hover:text-cyan-300 transition"
                  size={20}
                />
              </motion.div>

              <div className="flex-1">
                <h3 className="font-semibold text-cyan-300 leading-tight">
                  {toast.title}
                </h3>
                <p className="text-sm text-gray-300 mt-1 leading-snug">
                  {toast.message}
                </p>
                {toast.link && (
                  <a
                    href={toast.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs mt-2 text-cyan-400 font-medium hover:text-cyan-300 hover:underline transition-all duration-150"
                  >
                    View details →
                  </a>
                )}
              </div>

              {/* Glow pulse indicator */}
              <span className="absolute top-2 right-2 h-2 w-2 bg-cyan-400 rounded-full animate-ping opacity-75"></span>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
