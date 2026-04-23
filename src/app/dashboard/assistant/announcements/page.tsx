"use client ";
import { showErrorMessage } from "@/lib/helper";
import { Tektur } from "next/font/google";
import React, { useEffect, useState } from "react";
const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const page = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [campusId, setCampusId] = useState<string>();
  const [assistantId, setAssistantId] = useState<string>();
  useEffect(() => {
    const cId = localStorage.getItem("CampusID") || "";
    const aId = localStorage.getItem("assistantId") || "";
    setCampusId(cId);
    setAssistantId(aId);
  }, []);
  useEffect(() => {
    if (campusId && assistantId) {
      fetchAnnouncements();
    }
  }, [campusId, assistantId]);
  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(
        `/api/assistant/announcements?campusId=${campusId}&assistantId=${assistantId}`,
      );
      const result = await response.json();
      setAnnouncements(result.data || []);
    } catch (error) {
      showErrorMessage("Can't reach announcements right now");
    }
  };
  console.log({announcements})
  return (
    <div className={`${tektur.className}`}>
      <h1
        className={`${tektur.className} text-4xl text-center text-orange-200`}
      >
        Announcements
      </h1>
    </div>
  );
};

export default page;
