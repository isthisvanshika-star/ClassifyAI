"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Edit, PlusCircle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CreateAnnouncementModal from "@/components/teacher/CreateAnnouncementModal";
import { AnnouncementsLoadingSkeleton } from "@/components/teacher/SkeletonLoaders";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye } from "@fortawesome/free-solid-svg-icons";
import { showErrorMessage, showSuccessMessage } from "@/lib/helper";
import TConfirmModal from "@/components/ui/TConfirmModal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AnnouncementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<any | null>(
    null
  );
  const [announcementToEdit, setAnnouncementToEdit] = useState<any | null>(
    null
  ); // 1. ADD state for editing
  const [isDeleting, setIsDeleting] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [campusId, setCampusId] = useState<string | null>(null);

  useEffect(() => {
    setTeacherId(localStorage.getItem("teacherId"));
    setCampusId(localStorage.getItem("CampusID"));
  }, []);

  const handleDelete = async () => {
    if (!announcementToDelete || !teacherId) {
      showErrorMessage("An error occurred. Please refresh.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch("/api/teacher/announcements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          announcementId: announcementToDelete.id,
          teacherId: teacherId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete.");

      showSuccessMessage("Announcement deleted successfully.");
      mutate(); // Re-fetch announcements
      setAnnouncementToDelete(null);
    } catch (err: any) {
      showErrorMessage(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const { data, error, isLoading, mutate } = useSWR(
    teacherId && campusId
      ? `/api/teacher/announcements?teacherId=${teacherId}&campusId=${campusId}`
      : null,
    fetcher
  );

  const announcements = data?.announcements || [];

  return (
    <>
      <div className="flex flex-col h-full bg-transparent text-white p-8">
        {/* Header - fixed at top */}
        <header className="flex justify-between items-center mb-6 shrink-0">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
              Announcements
            </h1>
            <p className="mt-2 text-gray-400">
              Broadcast important updates to your students.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsModalOpen(true)}
            className="flex cursor-pointer items-center gap-2 px-5 py-2.5 font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] transition-all"
          >
            <PlusCircle size={20} />
            New Announcement
          </motion.button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pr-2">
          {isLoading && <AnnouncementsLoadingSkeleton />}

          {error && (
            <p className="text-center text-red-400 mt-10">
              Failed to load announcements. Please refresh.
            </p>
          )}

          {!isLoading && !error && (
            <AnimatePresence>
              {announcements.length === 0 ? (
                <motion.p
                  className="text-center text-gray-500 mt-16 text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  You haven't created any announcements yet.
                </motion.p>
              ) : (
                <div className="space-y-6">
                  {announcements.map((announcement: any, index: number) => (
                    <motion.div
                      key={announcement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_0_25px_rgba(0,255,255,0.3)] transition-all duration-300"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {announcement.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">
                            <span className="text-cyan-400">Posted on:</span>{" "}
                            {new Date(
                              announcement.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-xs text-center font-semibold bg-gradient-to-r from-cyan-500/30 to-blue-600/30 text-cyan-300 px-3 py-1 rounded-full border border-cyan-400/30">
                          <span className="mr-1">
                            <FontAwesomeIcon icon={faBullseye} />
                          </span>
                          <span className="ml-1">
                            {announcement.targetAll
                              ? "All Students"
                              : `Sem ${announcement.targetSemester} • Sec ${announcement.targetSection}`}
                          </span>
                        </span>
                      </div>
                      <p className="mt-4 text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {announcement.message}
                      </p>
                      <div className="flex justify-end gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => setAnnouncementToEdit(announcement)}
                          className="cursor-pointer relative group p-[2px] rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 hover:scale-110 transition-transform duration-300"
                          aria-label="Edit announcement"
                        >
                          <div className="rounded-full bg-[#0f172a]/90 p-2 group-hover:bg-[#1e293b]/90 backdrop-blur-md transition-colors duration-300">
                            <Edit
                              size={18}
                              className="text-cyan-300 group-hover:text-white transition-colors duration-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]"
                            />
                          </div>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setAnnouncementToDelete(announcement)}
                          className="cursor-pointer relative group p-[2px] rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:scale-110 transition-transform duration-300"
                          aria-label="Delete announcement"
                        >
                          <div className="rounded-full bg-[#0f172a]/90 p-2 group-hover:bg-[#1e293b]/90 backdrop-blur-md transition-colors duration-300">
                            <Trash2
                              size={18}
                              className="text-rose-400 group-hover:text-white transition-colors duration-300 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]"
                            />
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      <CreateAnnouncementModal
        isOpen={isModalOpen || !!announcementToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setAnnouncementToEdit(null);
        }}
        onSuccess={() => mutate()}
        mode={announcementToEdit ? "edit" : "create"}
        initialData={announcementToEdit}
      />

      <TConfirmModal
        isOpen={!!announcementToDelete}
        onClose={() => setAnnouncementToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message="Are you sure you want to permanently delete this announcement? This action cannot be undone."
        isLoading={isDeleting}
      />
    </>
  );
}
