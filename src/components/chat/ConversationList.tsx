"use client";

import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { Users, User } from "lucide-react";
import { motion } from "framer-motion";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ConversationListProps {
  userId: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ConversationList({
  userId,
  selectedId,
  onSelect,
}: ConversationListProps) {
  const { data: conversations, isLoading } = useSWR(
    `/api/chat/conversations?userId=${userId}`,
    fetcher,
    { refreshInterval: 10000 },
  );

  // 🔄 Skeleton Loader (improved)
  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-white/5 animate-pulse border border-white/5"
          />
        ))}
      </div>
    );
  }

  if (!conversations?.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
        No conversations yet
      </div>
    );
  }

  return (
    <ul className="flex-1 overflow-y-auto scrollbar-hide py-2 px-2">
      {conversations.map((conv: any, index: number) => {
        const isSelected = conv.id === selectedId;
        const isGroup = conv.type === "GROUP";
        const lastMessage = conv.messages?.[0];

        const otherParticipant = conv.participants?.find(
          (p: any) => p.userId !== userId,
        );

        const displayName = isGroup
          ? conv.name
          : (otherParticipant?.user?.name ?? "Unknown");

        return (
          <motion.li
            key={conv.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(conv.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left ${
                isSelected
                  ? "bg-white/10 border border-indigo-500/40 shadow-md"
                  : "hover:bg-white/5 border border-transparent"
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0 w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                {isGroup ? (
                  <Users size={18} className="text-indigo-400" />
                ) : (
                  <User size={18} className="text-indigo-400" />
                )}

                {/* subtle glow when selected */}
                {isSelected && (
                  <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-md" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white truncate">
                    {displayName}
                  </span>

                  {lastMessage && (
                    <span className="text-xs text-gray-500 ml-2 shrink-0">
                      {formatDistanceToNow(new Date(lastMessage.createdAt), {
                        addSuffix: false,
                      })}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {lastMessage ? "🔒 Encrypted message" : "No messages yet"}
                </p>
              </div>

              {/* Unread badge */}
              {conv.unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs flex items-center justify-center font-semibold"
                >
                  {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                </motion.span>
              )}
            </motion.button>
          </motion.li>
        );
      })}
    </ul>
  );
}
