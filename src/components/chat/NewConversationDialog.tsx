"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Users, User, Lock } from "lucide-react";
import useSWR from "swr";
import { mutate } from "swr";
import { NewConversationDialogProps } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

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
  const [isTeacherOnly, setIsTeacherOnly] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "");
  }, []);

  const usersUrl =
    campusId && userId
      ? `/api/users?campusId=${campusId}&requesterId=${userId}&forGroup=${mode === "GROUP"}${isTeacherOnly ? "&teacherOnly=true" : ""}`
      : null;

  const { data: users } = useSWR(usersUrl, fetcher);

  const filtered = users?.filter((u: any) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleSelect = (id: string) => {
    if (mode === "DIRECT") {
      setSelectedIds([id]);
      return;
    }
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
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
          isTeacherOnly: mode === "GROUP" ? isTeacherOnly : false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Create conversation error: ", data.error);
        return;
      }
      mutate(`/api/chat/conversations?userId=${userId}`);
      onCreated(data.id);
      handleClose();
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setSearch("");
    setGroupName("");
    setSelectedIds([]);
    setMode("DIRECT");
    setIsTeacherOnly(false);
    onClose();
  };

  const canCreateTeacherOnly = userRole === "TEACHER";

  const canCreateGroup = ["STUDENT", "TEACHER", "ASSISTANT"].includes(userRole);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(6px)" }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-md text-white p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-600/20 blur-3xl rounded-full" />

          {/* Header */}
          <div className="flex items-center justify-between mb-5 relative">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              New Conversation
            </h2>

            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              onClick={handleClose}
              className="p-1.5 hover:bg-white/10 rounded-full transition"
            >
              <X size={18} className="text-gray-400" />
            </motion.button>
          </div>

          {/* Mode toggle (pill style) */}
          <div className="relative flex bg-white/5 p-1 rounded-xl mb-5 border border-white/10">
            <motion.div
              layout
              className={`absolute top-1 bottom-1 w-1/2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500`}
              style={{
                left: mode === "DIRECT" ? "4px" : "50%",
              }}
            />

            {(["DIRECT", "GROUP"] as const).map((m) => {
              if (m === "GROUP" && !canCreateGroup) return null;
              const isActive = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setSelectedIds([]);
                  }}
                  className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium ${isActive ? "bg-indigo-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                >
                  {m === "DIRECT" ? <User size={15} /> : <Users size={15} />}
                  {m === "DIRECT" ? "Direct" : "Group"}
                </button>
              );
            })}
          </div>

          {/* Group name */}
          <AnimatePresence>
            {mode === "GROUP" && (
              <>
                <motion.input
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  type="text"
                  placeholder="Group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full bg-neutral-900/70 border border-white/10 p-3 rounded-xl text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {canCreateTeacherOnly && (
                  <button
                    onClick={() => {
                      setIsTeacherOnly((prev) => !prev);
                      setSelectedIds([]);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition border ${
                      isTeacherOnly
                        ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                        : " border-white/10 text-gray-400"
                    }`}
                  >
                    <Lock size={15} />
                    {isTeacherOnly
                      ? "Teacher-Only Group (locked)"
                      : "Make Teacher-Only Group"}
                  </button>
                )}
              </>
            )}
          </AnimatePresence>

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
              className="w-full bg-neutral-900/70 border border-white/10 pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Users */}
          <ul className="max-h-56 overflow-y-auto scrollbar-hide space-y-1 mb-5">
            {filtered?.map((user: any, i: number) => {
              const isSelected = selectedIds.includes(user.id);

              return (
                <motion.li
                  key={user.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleSelect(user.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                      isSelected
                        ? "bg-indigo-500/20 border border-indigo-500/40"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <User size={15} className="text-indigo-400" />
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.role}
                      </p>
                    </div>

                    <AnimatePresence>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="w-2 h-2 rounded-full bg-indigo-400"
                        />
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.li>
              );
            })}

            {filtered?.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-4">
                No users found
              </p>
            )}
          </ul>

          {/* Create */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCreate}
            disabled={
              isCreating ||
              selectedIds.length === 0 ||
              (mode === "GROUP" && !groupName.trim())
            }
            className="w-full py-2.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 font-semibold rounded-xl transition disabled:opacity-40"
          >
            {isCreating ? "Creating..." : "Start Conversation"}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
