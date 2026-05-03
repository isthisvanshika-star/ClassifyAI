"use client";

import { motion } from "framer-motion";

interface TypingIndicatorProps {
  typingUsers: Map<string, string>;
}

export default function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.size === 0) return null;

  const label =
    typingUsers.size === 1
      ? "Someone is typing"
      : `${typingUsers.size} people are typing`;

  return (
    <div className="flex items-center gap-2 px-1">
      {/* Animated dots */}
      <div className="flex items-center gap-1 bg-white/10 px-3 py-2 rounded-2xl rounded-bl-sm">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-indigo-400"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
