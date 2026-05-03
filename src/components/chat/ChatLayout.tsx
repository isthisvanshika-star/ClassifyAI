"use client";

import { use, useState } from "react";
import ConversationList from "./ConversationList";
import MessageThread from "./MessageThread";
import { Tektur } from "next/font/google";
import NewConversationDialog from "./NewConversationDialog";
import { Plus } from "lucide-react";

const tektur = Tektur({ subsets: ["latin"], weight: ["600"] });

interface ChatLayoutProps {
  userId: string;
  privateKey: string;
  campusId: string;
}

export default function ChatLayout({
  userId,
  privateKey,
  campusId,
}: ChatLayoutProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  return (
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-80 shrink-0 border-r border-white/10 flex flex-col bg-white/5 backdrop-blur-lg">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h1
            className={`text-xl font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-500 bg-clip-text text-transparent ${tektur.className}`}
          >
            Messages
          </h1>
          <button
            onClick={() => setIsNewChatOpen(true)}
            className="p-1.5 rounded-full hover:bg-white/10 transition text-gray-400 hover:text-white"
          >
            <Plus size={20} />
          </button>
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
      <NewConversationDialog
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        userId={userId}
        campusId={campusId}
        onCreated={(id) => {
          setSelectedConversationId(id);
          setIsNewChatOpen(false);
        }}
      />
    </div>
  );
}
