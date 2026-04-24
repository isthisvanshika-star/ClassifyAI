"use client";

import { getTimeAgo, showErrorMessage } from "@/lib/helper";
import { Tektur } from "next/font/google";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import CreateAnnouncementModal from "@/components/assistant/announcements/CreateAnnouncements";

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const Page = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [announcementModalOpen, setAnnouncementModalOpen] =
    useState<boolean>(false);
  const [campusId, setCampusId] = useState<string>();
  const [assistantId, setAssistantId] = useState<string>();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncements((prev) => [...prev]);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/assistant/announcements?campusId=${campusId}&assistantId=${assistantId}`,
      );

      if (response.ok) {
        const result = await response.json();
        setAnnouncements(result.data || []);
      }
    } catch (error) {
      showErrorMessage("Can't reach announcements right now");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const previous = announcements;
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));

      const res = await fetch(
        `/api/assistant/announcements?announcementId=${id}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        setAnnouncements(previous);
        showErrorMessage("Failed to delete announcement");
      }
    } catch (err) {
      showErrorMessage("Something went wrong");
    } finally {
      setSelectedAnnouncement(null);
    }
  };
  return (
    <motion.div
      className={`min-h-screen px-4 lg:px-10 py-6 space-y-8 text-white ${tektur.className} bg-gradient-to-br from-black via-[#0a0a0a] to-black`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h1
            className={`text-4xl font-semibold tracking-wide text-orange-300 ${tektur.className}`}
          >
            Announcements
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Stay updated with latest campus updates
          </p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl border-2 border-orange-700 px-4 py-2 cursor-pointer hover:bg-orange-700/20 transition"
          onClick={() => setAnnouncementModalOpen(true)}
        >
          <Plus size={18} />
          Create
        </button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center mt-40">
          <div className="text-xl animate-pulse text-gray-400">
            Loading announcements...
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
            layout
          >
            {announcements.length > 0 ? (
              announcements.map((a, index) => (
                <motion.div
                  key={a.id || index}
                  layout
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="group h-47 relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg hover:shadow-orange-500/20 transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/30"
                >
                  <button
                    onClick={() => setSelectedAnnouncement(a)}
                    className="absolute -top-2 -right-2 bg-gray-950/90 cursor-pointer z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:scale-90 sm:group-hover:scale-100 transition-all duration-30 hover:bg-red-500/30 border border-red-400/30 p-2 rounded-full hover:scale-110 active:scale-95"
                  >
                    <Trash size={16} className="text-red-400" />
                  </button>
                  <h3
                    className={`text-lg font-semibold text-orange-300 mb-2 ${tektur.className}`}
                  >
                    {a.title}
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {a.message}
                  </p>
                  <span className="text-xs text-gray-500 italic absolute bottom-2 right-4">
                    - {a.authorName}
                  </span>
                  <span className="text-[10px] text-gray-100 italic absolute bottom-1 left-4">
                    {getTimeAgo(a.createdAt)}
                  </span>
                </motion.div>
              ))
            ) : (
              <motion.div
                className="col-span-full text-center text-gray-400 mt-20 flex flex-col items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                No announcements available
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <CreateAnnouncementModal
        isOpen={!!announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
        mode="create"
        onSuccess={fetchAnnouncements}
        initialData={null}
      />
      <ConfirmModal
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        onConfirm={() => {
          handleDelete(selectedAnnouncement.id);
        }}
      />
    </motion.div>
  );
};

export default Page;
