"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2, Send, Type, UploadCloud, X } from "lucide-react";
import { showErrorMessage, showSuccessMessage } from "@/lib/helper";

export default function SubmitAssignmentModal({
  isOpen,
  onClose,
  onSuccess,
  studentId,
  assignment,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentId: string | null;
  assignment: any;
}) {
  const [submitMode, setSubmitMode] = useState<"file" | "text">("file");
  const [textAnswer, setTextAnswer] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLate = assignment?.dueDate
    ? new Date() > new Date(assignment.dueDate)
    : false;

  useEffect(() => {
    if (isOpen) {
      setSubmitMode("file");
      setTextAnswer("");
      setSelectedFile(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (studentId === null) {
      showErrorMessage("Can't find student details!");
      return;
    }
    if (submitMode === "text" && !textAnswer.trim()) {
      showErrorMessage("Please write an answer before submitting.");
      return;
    }

    if (submitMode === "file" && !selectedFile) {
      showErrorMessage("Please select a file to upload.");
      return;
    }

    setIsSubmitting(true);
    try {
      let fireUrl = null;
      if (submitMode === "file" && selectedFile) {
        const cloudName = "dd2bczbdo";
        const uploadPreset = "ClassifyAI-pdf";
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("upload_preset", uploadPreset);
        formData.append(
          "folder",
          `classify_ai/assignment/${assignment.id}_${studentId}`,
        );
        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
          {
            method: "POST",
            body: formData,
          },
        );
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(
            uploadData.error?.message || "Cloudinary upload failed!",
          );
        }
        fireUrl = uploadData.secure_url;
      }
      const response = await fetch("/api/student/assignments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment.id,
          studentId: studentId,
          content: submitMode === "text" ? textAnswer : null,
          fireUrl: submitMode === "file" ? fireUrl : null,
        }),
      });

      const result = await response.json();
      console.log({ result });
      if (response.ok) {
        showSuccessMessage("Assignment Submitted !!");
        onSuccess();
        window.location.reload();
      } else {
        showErrorMessage(
          result?.error || "Failed to Submit Assignment, try again later!!",
        );
        onClose();
      }
    } catch (error) {
      showErrorMessage("Can't Upload this time, try again later");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className="relative w-full max-w-3xl bg-slate-900/95 backdrop-blur-xl border border-cyan-500/40 p-6 md:p-8 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.2)] overflow-hidden z-10 text-white"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">
              Submit Your {assignment.title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-400 bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>
          {isLate && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">The due date has passed!</p>
                <p className="text-sm opacity-80">
                  You can still submit, but your work will be marked as "Late"
                  to your teacher.
                </p>
              </div>
            </div>
          )}
          {/* Toggle */}
          <div className="flex gap-2 mb-6 bg-slate-800 p-1 rounded-xl w-fit">
            <button
              onClick={() => setSubmitMode("text")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                submitMode === "text"
                  ? "bg-cyan-500 text-slate-900 shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Type size={18} /> Write Answer
            </button>

            <button
              onClick={() => setSubmitMode("file")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                submitMode === "file"
                  ? "bg-cyan-500 text-slate-900 shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <UploadCloud size={18} /> Upload File
            </button>
          </div>

          {/* TEXT MODE */}
          {submitMode === "text" && (
            <motion.textarea
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-56 bg-slate-800/50 border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none placeholder-gray-500"
            />
          )}

          {/* FILE MODE */}
          {submitMode === "file" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-cyan-500/30 rounded-2xl bg-slate-800/30 hover:bg-slate-800/50 hover:border-cyan-500/60 transition-all group"
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={(e) =>
                  setSelectedFile(
                    e.target.files && e.target.files.length > 0
                      ? e.target.files[0]
                      : null,
                  )
                }
              />

              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-4 w-full h-full justify-center"
              >
                <div className="p-5 bg-cyan-500/10 group-hover:bg-cyan-500/20 rounded-full text-cyan-400">
                  <UploadCloud size={36} />
                </div>

                {selectedFile ? (
                  <p className="text-cyan-300 font-semibold text-lg bg-cyan-500/10 px-4 py-2 rounded-lg">
                    {selectedFile.name}
                  </p>
                ) : (
                  <>
                    <p className="text-white font-medium text-lg">
                      Click to browse or drag file here
                    </p>
                    <p className="text-sm text-gray-400">
                      Accepts PDF, DOC, Images (Max 10MB)
                    </p>
                  </>
                )}
              </label>
            </motion.div>
          )}

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-4 border-t border-white/10 pt-6">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 font-semibold py-2.5 px-8 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              Submit Assignment
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
