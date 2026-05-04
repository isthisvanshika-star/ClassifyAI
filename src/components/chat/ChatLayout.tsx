"use client";

import { useState } from "react";
import ConversationList from "./ConversationList";
import MessageThread from "./MessageThread";
import NewConversationDialog from "./NewConversationDialog";
import { ChevronLeft, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative flex h-[100dvh] bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white overflow-hidden"
    >
      {/* Back Button */}
      <div className="absolute top-3 left-5 z-10">
        <button
          onClick={() => router.push("/dashboard/student")}
          className="flex items-center justify-center p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-lg hover:bg-cyan-500/20 hover:border-cyan-400 text-white transition-all duration-300"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* Glow Effects */}
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-purple-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[300px] h-[300px] bg-indigo-600/20 blur-[120px] rounded-full" />

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-80 shrink-0 border-r border-white/10 flex flex-col bg-white/5 backdrop-blur-xl"
      >
        <div className="p-5 border-b  border-white/10 flex items-center justify-between">
          <h1 className="text-2xl pl-15  font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-500 bg-clip-text text-transparent tracking-wide">
            Messages
          </h1>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsNewChatOpen(true)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition text-gray-400 hover:text-white"
          >
            <Plus size={18} />
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <ConversationList
            userId={userId}
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
          />
        </div>
      </motion.aside>

      {/* Main Chat Area */}
      <main className="relative flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {selectedConversationId ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="h-full flex flex-col bg-black/20 backdrop-blur-sm"
            >
              <MessageThread
                userId={userId}
                conversationId={selectedConversationId}
                privateKey={privateKey}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-center text-gray-400 relative z-20 pt-16"
            >
              <div className="flex flex-col items-center gap-4 px-8 py-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 120 }}
                  className="text-5xl opacity-80"
                >
                  <img
                    src="/chat-logo.png"
                    alt="no conversation"
                    className="w-30 h-30"
                  />
                </motion.div>

                <div className="text-center space-y-1">
                  <p className="text-sm text-gray-300">
                    No conversation selected
                  </p>
                  <p className="text-xs text-gray-500">
                    Choose a chat from the left or start a new one
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsNewChatOpen(true)}
                  className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 text-sm font-medium"
                >
                  Start New Chat
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* New Chat Dialog */}
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
    </motion.div>
  );
}