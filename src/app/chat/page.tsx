"use client";

import { useEffect, useState } from "react";
import ChatLayout from "@/components/chat/ChatLayout";
import { initUserKeys } from "@/lib/init-keys";
import { motion } from "framer-motion";

export default function ChatPage() {
  const [userId, setUserId] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [campusId, setCampusId] = useState("");
  const [isReady, setIsReady] = useState(false);
 
  useEffect(() => {
    const init = async () => {
      const id =
        localStorage.getItem("studentId") ||
        localStorage.getItem("teacherId") ||
        localStorage.getItem("adminId") ||
        localStorage.getItem("assistantId") ||
        "";
      const campus = localStorage.getItem("CampusID") || "";
      if (!id) return;
      const key = await initUserKeys(id);
      setUserId(id);
      setPrivateKey(key);
      setCampusId(campus);
      setIsReady(true);
    };
    init();
  }, []);


  if (!isReady) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative flex h-[100dvh] items-center justify-center bg-gradient-to-br from-gray-950 via-black to-gray-900 text-gray-400"
      >

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute w-[400px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full"
        />
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative flex flex-col items-center gap-4 px-8 py-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
          />
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-gray-400 tracking-wide"
          >
            Initializing secure session...
          </motion.p>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.4 }}
            className="text-xs text-gray-600"
          >
            Setting up encryption keys
          </motion.span>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ChatLayout userId={userId} privateKey={privateKey} campusId={campusId} />
    </motion.div>
  );
}
