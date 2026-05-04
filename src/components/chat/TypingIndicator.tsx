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
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 px-1"
    >
      {/* Bubble */}
      <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl rounded-bl-sm border border-white/10 shadow-sm">
        
        {/* Dots */}
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400"
            animate={{
              y: [0, -5, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Label */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ delay: 0.2 }}
        className="text-xs text-gray-500"
      >
        {label}
      </motion.span>
    </motion.div>
  );
}