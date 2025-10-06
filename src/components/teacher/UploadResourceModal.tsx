"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, File as FileIcon, X } from "lucide-react";

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
  const [file, setFile] = useState<File | null>(null);
  const [teacherSubjects, setTeacherSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch the teacher's subjects to populate the dropdown
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setSelectedSubject("");
      setFile(null);

      const teacherId = localStorage.getItem("teacherId");
      const campusId = localStorage.getItem("CampusID");

      if (teacherId && campusId) {
        fetch(`/api/teacher/subjects?teacherId=${teacherId}&campusId=${campusId}`)
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
      toast.error("Please fill in all fields and select a file.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Uploading resource...");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("subjectId", selectedSubject);
    formData.append("teacherId", teacherId);
    formData.append("campusId", campusId);
    formData.append("file", file);

    try {
      const res = await fetch("/api/teacher/resources", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      toast.dismiss(toastId);

      if (!res.ok) throw new Error(data.error || "Failed to upload resource.");

      toast.success("Resource uploaded successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-lg bg-white/10 border border-white/20 backdrop-blur-2xl rounded-2xl shadow-[0_0_30px_rgba(56,189,248,0.2)] text-white p-8"
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent">
              Upload Resource
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-5">
            <input
              type="text"
              placeholder="Enter Resource Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/10 border border-white/20 p-3 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            />

            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-white/10 border border-white/20 p-3 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            ></textarea>

            <div>
              <label className="text-sm text-gray-300 mb-1 block">
                Linked Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-white/10 border border-white/20 p-3 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              >
                {teacherSubjects.map((ts) => (
                  <option key={ts.subject.id} value={ts.subject.id}>
                    {ts.subject.name} ({ts.semester.name}, {ts.section.name})
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="text-sm text-gray-300 mb-2 block">
                Resource File
              </label>
              <div className="relative border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-cyan-400 transition">
                <UploadCloud className="mx-auto h-12 w-12 text-cyan-400" />
                <p className="text-sm text-gray-400 mt-2">
                  Drag & drop or{" "}
                  <label
                    htmlFor="file-upload"
                    className="text-blue-400 cursor-pointer hover:underline"
                  >
                    browse files
                  </label>
                </p>
                <input
                  id="file-upload"
                  name="file"
                  type="file"
                  className="sr-only"
                  onChange={(e) =>
                    setFile(e.target.files ? e.target.files[0] : null)
                  }
                />

                {file && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-cyan-300 text-sm bg-white/5 py-2 px-3 rounded-lg border border-cyan-500/30">
                    <FileIcon size={16} />
                    <span className="truncate max-w-[200px]">{file.name}</span>
                    <button
                      onClick={() => setFile(null)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 pt-8 mt-6 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-semibold bg-white/10 hover:bg-white/20 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="relative overflow-hidden group px-5 py-2 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 hover:scale-105 transition-transform disabled:opacity-50"
            >
              {isLoading ? "Uploading..." : "Upload Resource"}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-cyan-400/30 opacity-0 group-hover:opacity-100 blur-md transition"></span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
