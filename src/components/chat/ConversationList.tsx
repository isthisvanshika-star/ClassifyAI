"use client";

import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import { Users, User } from "lucide-react";

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

  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
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
    <ul className="flex-1 overflow-y-auto scrollbar-hide py-2">
      {conversations.map((conv: any) => {
        const isSelected = conv.id === selectedId;
        const isGroup = conv.type === "GROUP";
        const lastMessage = conv.messages?.[0];

        // for DMs, show the other person's name
        const otherParticipant = conv.participants?.find(
          (p: any) => p.userId !== userId,
        );
        const displayName = isGroup
          ? conv.name
          : (otherParticipant?.user?.name ?? "Unknown");

        return (
          <li key={conv.id}>
            <button
              onClick={() => onSelect(conv.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-white/5 ${
                isSelected ? "bg-white/10 border-l-2 border-indigo-500" : ""
              }`}
            >
              {/* Avatar */}
              <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                {isGroup ? (
                  <Users size={18} className="text-indigo-400" />
                ) : (
                  <User size={18} className="text-indigo-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white truncate">
                    {displayName}
                  </span>
                  {lastMessage && (
                    <span className="text-xs text-gray-500 shrink-0 ml-2">
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
                <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-semibold">
                  {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
