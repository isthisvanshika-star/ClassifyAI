"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Semester, Section } from "@/lib/types";
import {
  showErrorMessage,
  showLoadingMessage,
  showSuccessMessage,
  toastDissmisser,
} from "@/lib/helper";
import { Tektur } from "next/font/google";

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function CreateAnnouncementModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "create" | "edit";
  initialData?: any;
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAll, setTargetAll] = useState(true);
  const [targetSemester, setTargetSemester] = useState("");
  const [targetSection, setTargetSection] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setTitle(initialData.title || "");
        setMessage(initialData.message || "");
        setTargetAll(initialData.targetAll || true);
        setTargetSemester(initialData.targetSemester?.toString() || "");
        setTargetSection(initialData.targetSection || "");
      } else {
        setTitle("");
        setMessage("");
        setTargetAll(true);
        setTargetSemester("");
        setTargetSection("");
      }
      const campusId = localStorage.getItem("CampusID");
      if (campusId) {
        const fetchDropdownData: () => Promise<void> = async () => {
          try {
            const [semestersRes, sectionsRes] = await Promise.all([
              fetch(`/api/assistant/semester/all?campusId=${campusId}`),
              fetch(`/api/assistant/sections/all?campusId=${campusId}`),
            ]);
            if (!semestersRes.ok || !sectionsRes.ok)
              throw new Error("Failed to load data.");
            setSemesters(await semestersRes.json());
            setSections(await sectionsRes.json());
          } catch (error: any) {
            showErrorMessage(error.message);
          }
        };
        fetchDropdownData();
      }
    }
  }, [isOpen, mode, initialData]);

  const handleSubmit = async () => {
    const assistantId = localStorage.getItem("assistantId");
    const campusId = localStorage.getItem("CampusID");

    if (!title || !message || !assistantId || !campusId) {
      showErrorMessage("Title and message are required.");
      return;
    }
    if (!targetAll && (!targetSemester || !targetSection)) {
      showErrorMessage("Please select a target semester and section.");
      return;
    }

    setIsLoading(true);
    const toastId = showLoadingMessage(
      mode === "create" ? "Posting..." : "Updating...",
    );

    try {
      const body: any = {
        title,
        message,
        targetAll,
        campusId,
        ...(!targetAll && {
          targetSemester: Number(targetSection),
          targetSection,
        }),
      };

      if (mode === "edit") {
        body.announcementId = initialData.id;
      }

      const response = await fetch(
        `/api/assistant/announcements?assistantId= ${assistantId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          body: JSON.stringify(body),
        },
      );

      const data = await response.json();
      toastDissmisser(toastId);

      if (!response.ok) {
        throw new Error(data.error || "Failed to post announcement.");
      }

      showSuccessMessage(
        `Announcement  ${
          mode === "create" ? "posted" : "updated"
        }  successfully!`,
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toastDissmisser(toastId);
      showErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-lg rounded-2xl p-6 bg-gradient-to-r from-white/5 via-orange-500/10 to-white/[0.02] backdrop-blur-xl border border-white/10 shadow-2xl hover:shadow-orange-500/20 transition"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2
            className={`${tektur.className} text-2xl font-semibold  text-orange-300 mb-6`}
          >
            {mode === "create" ? "New" : "Edit"} Announcement
          </h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-lg focus:ring-2 focus:ring-orange-400/60 outline-none placeholder-gray-400"
            />
            <textarea
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full bg-white/5 border border-white/10 p-3 rounded-lg focus:ring-2 focus:ring-orange-400/60 outline-none placeholder-gray-400"
            ></textarea>
            <div>
              <label className="text-sm text-gray-400">Target Audience</label>
              <div className="mt-2 flex gap-2 p-1 rounded-lg bg-white/5 border border-white/10">
                <button
                  onClick={() => setTargetAll(true)}
                  className={`w-1/2 py-2 rounded-md text-sm font-semibold transition ${
                    targetAll
                      ? "bg-orange-500 text-white shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  All Students
                </button>
                <button
                  onClick={() => setTargetAll(false)}
                  className={`w-1/2 py-2 rounded-md text-sm font-semibold transition ${
                    !targetAll
                      ? "bg-orange-500 text-white shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Specific Class
                </button>
              </div>

              <AnimatePresence>
                {!targetAll && (
                  <motion.div
                    className="grid grid-cols-1 mt-4 md:grid-cols-2 gap-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <select
                      value={targetSemester}
                      onChange={(e) => setTargetSemester(e.target.value)}
                      className="bg-white/5 border appearance-none border-white/10 p-3 rounded-lg focus:ring-2 focus:ring-orange-400/60 outline-none"
                    >
                      <option className="bg-black text-gray-400" value="">
                        Select Semester
                      </option>
                      {semesters.map((s) => (
                        <option
                          className="bg-black text-gray-400"
                          key={s.id}
                          value={s.number}
                        >
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={targetSection}
                      onChange={(e) => setTargetSection(e.target.value)}
                      className="bg-white/5 border border-white/10 appearance-none p-3 rounded-lg focus:ring-2 focus:ring-orange-400/60 outline-none"
                    >
                      <option className="bg-black text-gray-400" value="">
                        Select Section
                      </option>
                      {sections.map((s) => (
                        <option
                          className="bg-black text-gray-400"
                          key={s.id}
                          value={s.name}
                        >
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-white/10">
              <button
                onClick={onClose}
                className="py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="py-2 px-4 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg shadow-md transition disabled:opacity-50"
              >
                {isLoading
                  ? mode === "create"
                    ? "Posting..."
                    : "Saving..."
                  : mode === "create"
                    ? "Post Announcement"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
