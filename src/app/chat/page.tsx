// src/app/chat/page.tsx
"use client";

import { useEffect, useState } from "react";
import ChatLayout from "@/components/chat/ChatLayout";
import { secureGet } from "@/lib/tauri-store";
import { initUserKeys } from "@/lib/init-keys";

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
      <div className="flex h-screen items-center justify-center bg-neutral-950 text-gray-500 text-sm">
        Loading secure keys...
      </div>
    );
  }

  return (
    <ChatLayout userId={userId} privateKey={privateKey} campusId={campusId} />
  );
}
