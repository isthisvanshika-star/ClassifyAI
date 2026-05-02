"use client";

import { useState } from "react";
import ConversationList from "./ConversationList";
import MessageThread from "./MessageThread";
import { Tektur } from "next/font/google";

const tektur = Tektur({ subsets: ["latin"], weight: ["600"] });

interface ChatLayoutProps {
  userId: string;
  privateKey: string;
}

export default function ChatLayout({ userId, privateKey }: ChatLayoutProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  return (
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-80 shrink-0 border-r border-white/10 flex flex-col bg-white/5 backdrop-blur-lg">
        <div className="p-5 border-b border-white/10">
          <h1
            className={`text-xl font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-500 bg-clip-text text-transparent ${tektur.className}`}
          >
            Messages
          </h1>
        </div>
        <ConversationList
          userId={userId}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
        />
      </aside>

      {/* ── Main Thread ── */}
      <main className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <MessageThread
            userId={userId}
            conversationId={selectedConversationId}
            privateKey={privateKey}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-500">
            <span className="text-5xl">💬</span>
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </main>
    </div>
  );
}
