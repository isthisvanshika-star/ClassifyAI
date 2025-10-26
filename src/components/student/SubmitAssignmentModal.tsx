"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { showErrorMessage, showLoadingMessage, showSuccessMessage, toastDissmisser } from "@/lib/helper";

export default function SubmitAssignmentModal({
  isOpen,
  onClose,
  onSuccess,
  assignment,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assignment: any;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [campusId, setCampusId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStudentId(localStorage.getItem("studentId"));
      setCampusId(localStorage.getItem("CampusID"));
      setFile(null);
      setText("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!studentId || !campusId) {
      showErrorMessage("Session expired. Please log in again.");
      return;
    }
    if (!file && !text.trim()) {
      showErrorMessage("Please upload a file or write a comment.");
      return;
    }

    setIsLoading(true);
    const toastId = showLoadingMessage("Submitting your assignment...");

    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append("campusId", campusId);
    formData.append("assignmentId", assignment.id);
    if (file) formData.append("file", file);
    if (text) formData.append("text", text);

    try {
      const res = await fetch("/api/student/submissions", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      toastDissmisser(toastId);

      if (!res.ok) throw new Error(data.error || "Submission failed.");

      showSuccessMessage("Assignment submitted successfully!");
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
        className="fixed inset-0 bg-black/70 backdrop-blur-xs flex justify-center items-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-[#11151F] backdrop-blur-2xl border border-gray-700 p-8 rounded-2xl shadow-2xl w-full max-w-lg relative text-white"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-cyan-400"
            onClick={onClose}
          >
            <X size={20} />
          </button>

          {/* Header */}
          <h2 className="text-2xl font-bold text-cyan-400 mb-1">
            {assignment.title}
          </h2>
          <p className="text-gray-400 mb-6 text-sm">Submit Assignment</p>

          {/* File Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">
              Upload File (PDF, DOCX, etc.)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-cyan-400 transition-colors cursor-pointer">
              <div className="space-y-2 text-center" onClick={() => document.getElementById('file-upload')?.click()}>
                <UploadCloud className="mx-auto h-12 w-12 text-cyan-400" />
                <p className="text-sm text-gray-400">
                  <span className="text-cyan-400 font-semibold hover:underline">Click to upload</span> or drag file here
                </p>
                {file && (
                  <p className="text-xs text-green-400 flex items-center justify-center gap-2">
                    <FileIcon size={14} /> {file.name}
                  </p>
                )}
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                />
              </div>
            </div>

            {/* Text Submission */}
            <textarea
              placeholder="Or add a text comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full bg-[#1B1F2B] p-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-cyan-400 outline-none placeholder-gray-500 text-white"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-700">
            <button
              onClick={onClose}
              className="py-2 px-4 bg-gray-700 hover:bg-gray-600 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`py-2 px-4 bg-cyan-500 hover:bg-cyan-400 font-semibold rounded-lg disabled:bg-cyan-700 transition-colors`}
            >
              {isLoading ? "Submitting..." : "Submit Assignment"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
