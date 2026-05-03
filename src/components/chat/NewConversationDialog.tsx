"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Users, User } from "lucide-react";
import { Tektur } from "next/font/google";
import useSWR from "swr";
import { mutate } from "swr";

const tektur = Tektur({ subsets: ["latin"], weight: ["600"] });
const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface NewConversationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  campusId: string;
  onCreated: (conversationId: string) => void;
}

export default function NewConversationDialog({
  isOpen,
  onClose,
  userId,
  campusId,
  onCreated,
}: NewConversationDialogProps) {
  const [mode, setMode] = useState<"DIRECT" | "GROUP">("DIRECT");
  const [search, setSearch] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // fetch campus users to select from
  const { data: users } = useSWR(
    campusId ? `/api/users?campusId=${campusId}` : null,
    fetcher
  );

  const filtered = users?.filter(
    (u: any) =>
      u.id !== userId &&
      u.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    if (mode === "DIRECT") {
      setSelectedIds([id]);
      return;
    }
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (selectedIds.length === 0) return;
    if (mode === "GROUP" && !groupName.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mode,
          name: mode === "GROUP" ? groupName : undefined,
          campusId,
          creatorId: userId,
          participantIds: selectedIds,
        }),
      });

      const conversation = await res.json();
      mutate(`/api/chat/conversations?userId=${userId}`);
      onCreated(conversation.id);
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setSearch("");
    setGroupName("");
    setSelectedIds([]);
    setMode("DIRECT");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md text-white p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2
              className={`text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent ${tektur.className}`}
            >
              New Conversation
            </h2>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-white/10 rounded-full transition"
            >
              <X size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2 mb-5">
            {(["DIRECT", "GROUP"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setSelectedIds([]);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition ${
                  mode === m
                    ? "bg-indigo-500 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {m === "DIRECT" ? (
                  <User size={15} />
                ) : (
                  <Users size={15} />
                )}
                {m === "DIRECT" ? "Direct Message" : "Group Chat"}
              </button>
            ))}
          </div>

          {/* Group name input */}
          {mode === "GROUP" && (
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-neutral-900/70 border border-gray-700/40 p-3 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          )}

          {/* Search */}
          <div className="relative mb-3">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search people..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-900/70 border border-gray-700/40 pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* User list */}
          <ul className="max-h-56 overflow-y-auto scrollbar-hide space-y-1 mb-5">
            {filtered?.map((user: any) => {
              const isSelected = selectedIds.includes(user.id);
              return (
                <li key={user.id}>
                  <button
                    onClick={() => toggleSelect(user.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-left ${
                      isSelected
                        ? "bg-indigo-500/20 border border-indigo-500/40"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <User size={15} className="text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.role}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                    )}
                  </button>
                </li>
              );
            })}
            {filtered?.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-4">
                No users found
              </p>
            )}
          </ul>

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={
              isCreating ||
              selectedIds.length === 0 ||
              (mode === "GROUP" && !groupName.trim())
            }
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:from-indigo-600 hover:via-violet-600 hover:to-purple-700 font-semibold rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Start Conversation"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}