// src/app/chat/page.tsx
"use client";

import { useEffect, useState } from "react";
import ChatLayout from "@/components/chat/ChatLayout";

export default function ChatPage() {
  const [userId, setUserId] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  useEffect(() => {
    const id =
      localStorage.getItem("studentId") ||
      localStorage.getItem("teacherId") ||
      localStorage.getItem("adminId") ||
      "";
    const key = localStorage.getItem(`privateKey_${id}`) || "";
    setUserId(id);
    setPrivateKey(key);
  }, []);

  if (!userId) return null;

  return <ChatLayout userId={userId} privateKey={privateKey} />;
}
