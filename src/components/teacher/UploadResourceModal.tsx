"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  File as FileIcon,
  X,
  BookOpen,
  FileQuestion,
  FileText,
  Video,
} from "lucide-react";
import {
  showErrorMessage,
  showLoadingMessage,
  showSuccessMessage,
  toastDissmisser,
} from "@/lib/helper";

const resourceTypes = [
  { id: "NOTES", label: "Notes", icon: <BookOpen size={16} /> },
  { id: "PYQ", label: "PYQs", icon: <FileQuestion size={16} /> },
  { id: "SYLLABUS", label: "Syllabus", icon: <FileText size={16} /> },
  { id: "VIDEO_LINK", label: "Video", icon: <Video size={16} /> },
];

export default function UploadResourceModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [resourceType, setResourceType] = useState("NOTES");
  const [file, setFile] = useState<File | null>(null);
  const [teacherSubjects, setTeacherSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setSelectedSubject("");
      setResourceType("NOTES");
      setFile(null);

      const teacherId = localStorage.getItem("teacherId");
      const campusId = localStorage.getItem("CampusID");

      if (teacherId && campusId) {
        fetch(
          `/api/teacher/subjects?teacherId=${teacherId}&campusId=${campusId}`,
        )
          .then((res) => res.json())
          .then((data) => {
            setTeacherSubjects(data);
            if (data.length > 0) setSelectedSubject(data[0].subject.id);
          });
      }
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    const teacherId = localStorage.getItem("teacherId");
    const campusId = localStorage.getItem("CampusID");

    if (!file || !title || !selectedSubject || !teacherId || !campusId) {
      showErrorMessage("Please fill all required fields.");
      return;
    }

    setIsLoading(true);

    const isAIEligible =
      file.type.endsWith(".pdf") &&
      (resourceType === "NOTES" || resourceType === "PYQ");

    const toastId = showLoadingMessage(
      isAIEligible
        ? "Uploading & generating AI summary..."
        : "Uploading resource...",
    );

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("subjectId", selectedSubject);
    formData.append("resourceType", resourceType);
    formData.append("teacherId", teacherId);
    formData.append("campusId", campusId);
    formData.append("file", file);

    try {
      const res = await fetch("/api/teacher/resources", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      toastDissmisser(toastId);

      if (!res.ok) throw new Error(data.error);

      showSuccessMessage("Uploaded successfully");
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
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-xl rounded-3xl p-8 text-white
          bg-gradient-to-br from-white/10 to-white/5 
          border border-white/20 backdrop-blur-2xl
          shadow-[0_0_50px_rgba(56,189,248,0.15)]"
          initial={{ scale: 0.9, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 40 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              Upload Resource
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition"
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {resourceTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setResourceType(type.id)}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-sm transition-all
                  ${
                    resourceType === type.id
                      ? "bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-lg"
                      : "bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400"
                  }`}
              >
                {type.icon} {type.label}
              </button>
            ))}
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Resource title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-style"
            />

            <textarea
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-style h-24"
            />

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input-style"
            >
              {teacherSubjects.map((ts) => (
                <option key={ts.subject.id} value={ts.subject.id}>
                  {ts.subject.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-6">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition
              ${
                file
                  ? "border-green-400/50 bg-green-400/5"
                  : "border-white/20 hover:border-cyan-400"
              }`}
            >
              {!file ? (
                <>
                  <UploadCloud className="mx-auto text-cyan-400 mb-2" />
                  <p className="text-sm text-gray-400">
                    Drag & drop or{" "}
                    <label
                      htmlFor="file"
                      className="text-blue-400 cursor-pointer"
                    >
                      browse
                    </label>
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <FileIcon />
                  <span className="text-sm truncate">{file.name}</span>
                  <button
                    onClick={() => setFile(null)}
                    className="text-xs text-red-400"
                  >
                    Remove
                  </button>
                </div>
              )}
              <input
                id="file"
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 hover:scale-105 transition"
            >
              {isLoading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
