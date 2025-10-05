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
        const fetchDropdownData = async () => {
          try {
            const [semestersRes, sectionsRes] = await Promise.all([
              fetch(`/api/teacher/semester/all?campusId=${campusId}`),
              fetch(`/api/teacher/sections/all?campusId=${campusId}`),
            ]);
            console.log({ semestersRes, sectionsRes });
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
    const teacherId = localStorage.getItem("teacherId");
    const campusId = localStorage.getItem("CampusID");

    if (!title || !message || !teacherId || !campusId) {
      showErrorMessage("Title and message are required.");
      return;
    }
    if (!targetAll && (!targetSemester || !targetSection)) {
      showErrorMessage("Please select a target semester and section.");
      return;
    }

    setIsLoading(true);
    const toastId = showLoadingMessage(
      mode === "create" ? "Posting..." : "Updating..."
    );

    try {
      const basePayload = {
        teacherId,
        title,
        message,
        targetAll,
        targetSemester: !targetAll ? parseInt(targetSemester) : null,
        targetSection: !targetAll ? targetSection : null,
      };

      const payload =
        mode === "edit"
          ? { ...basePayload, announcementId: initialData.id }
          : basePayload;

      const response = await fetch("/api/teacher/announcements", {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      toastDissmisser(toastId);

      if (!response.ok) {
        throw new Error(data.error || "Failed to post announcement.");
      }

      showSuccessMessage(
        `Announcement  ${
          mode === "create" ? "posted" : "updated"
        } posted successfully!`
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
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-lg rounded-2xl p-[1px] bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-2xl bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 shadow-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {mode === "create" ? "New" : "Edit"} Announcement
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/10 border border-white/10 p-3 rounded-md focus:ring-2 focus:ring-blue-400/60 focus:outline-none placeholder-gray-400"
              />
              <textarea
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full bg-white/10 border border-white/10 p-3 rounded-md focus:ring-2 focus:ring-blue-400/60 focus:outline-none placeholder-gray-400"
              ></textarea>

              <div>
                <label className="text-sm font-medium text-gray-300">
                  Target Audience
                </label>
                <div className="mt-2 flex gap-2 p-1 rounded-lg bg-white/10 border border-white/10 backdrop-blur-lg">
                  <button
                    onClick={() => setTargetAll(true)}
                    className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-all ${
                      targetAll
                        ? "bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500 text-white shadow-lg"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    All Students
                  </button>
                  <button
                    onClick={() => setTargetAll(false)}
                    className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-all ${
                      !targetAll
                        ? "bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500 text-white shadow-lg"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Specific Class
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {!targetAll && (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <select
                      value={targetSemester}
                      onChange={(e) => setTargetSemester(e.target.value)}
                      className="w-full appearance-none bg-white/10 border border-white/10 p-3 rounded-md focus:ring-2 focus:ring-blue-400/60 outline-none"
                    >
                      <option value="">Select Semester</option>
                      {semesters.map((s) => (
                        <option key={s.id} value={s.number}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={targetSection}
                      onChange={(e) => setTargetSection(e.target.value)}
                      className="w-full appearance-none bg-white/10 border border-white/10 p-3 rounded-md focus:ring-2 focus:ring-blue-400/60 outline-none"
                    >
                      <option value="">Select Section</option>
                      {sections.map((s) => (
                        <option key={s.id} value={s.name}>
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
                className="py-2 px-4 bg-white/10 hover:bg-white/20 border border-white/10 font-semibold rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="py-2 px-4 bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500 hover:from-violet-400 hover:via-blue-400 hover:to-cyan-400 font-semibold rounded-lg shadow-md transition-all disabled:opacity-50"
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
