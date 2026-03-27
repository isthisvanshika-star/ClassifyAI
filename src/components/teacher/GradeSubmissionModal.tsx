"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  openInBrowser,
  showErrorMessage,
  showLoadingMessage,
  showSuccessMessage,
} from "@/lib/helper";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FileText,
} from "lucide-react";

export default function GradeSubmissionModal({
  isOpen,
  onClose,
  onSuccess,
  submission,
  allSubmissions,
  onNavigate,
  totalMarks,
  dueDate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  submission: any;
  allSubmissions: any[];
  onNavigate: (sub: any) => void;
  totalMarks: number | null;
  dueDate: string | null;
}) {
  const [grade, setGrade] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  const currentIndex = allSubmissions.findIndex((s) => s.id === submission.id);
  const hasNext = currentIndex < allSubmissions.length - 1;

  const isLate =
    dueDate && new Date(submission.submittedAt) > new Date(dueDate);

  useEffect(() => {
    if (isOpen) {
      setTeacherId(localStorage.getItem("teacherId"));
      setGrade(submission?.grade?.toString() || "");
      setFeedback(submission?.feedback || "");
    }
  }, [isOpen, submission]);

  const saveGradeToDB = async () => {
    if (!teacherId) throw new Error("Session expired. Please Log in again.");
    const numericGrade = parseFloat(grade);
    if (grade === "" || isNaN(numericGrade)) {
      throw new Error("Please enter a valid numeric grade.");
    }
    if (totalMarks && numericGrade > totalMarks) {
      throw new Error(`Grade cannot be greater than ${totalMarks}`);
    }
    const response = await fetch(`/api/teacher/submissions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submissionId: submission.id,
        teacherId: teacherId,
        grade: numericGrade,
        feedback,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to Save Grade");
    }
    return data;
  };

  const handleSave = async () => {
    setIsLoading(true);
    showLoadingMessage("Saving Grade...");
    try {
      await saveGradeToDB();
      showSuccessMessage("Grade saved successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      showErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndNext = async () => {
    setIsNextLoading(true);
    showLoadingMessage("Saving and movinf to next...");
    try {
      await saveGradeToDB();
      showSuccessMessage("Grade Saved!");
      onSuccess();
      onNavigate(allSubmissions[currentIndex + 1]);
    } catch (error: any) {
      showErrorMessage(error.message || "Internal Server Error");
    } finally {
      setIsNextLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-slate-900 border border-indigo-500/30 p-8 rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.15)] w-full max-w-lg text-white relative overflow-hidden flex flex-col max-h-[90vh]"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-indigo-400 mb-1">
                Grade Submission
              </h2>
              <p className="text-gray-400 text-sm font-medium">
                Student:{" "}
                <span className="text-white">
                  {submission?.student?.user?.name}
                </span>
              </p>
            </div>
            {isLate ? (
              <span className="flex items-center gap-1 bg-red-500/10 text-red-400 text-xs px-3 py-1.5 rounded-full border border-red-500/20">
                <AlertCircle size={14} /> Late Submission
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 size={14} /> On Time
              </span>
            )}
          </div>

          <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar">
            {submission.fileUrl && (
              <button
                onClick={(e) => openInBrowser(e, submission.fileUrl)}
                className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:border-indigo-400/50 hover:bg-white/10 p-4 rounded-xl text-indigo-300 font-semibold transition-all duration-300 group"
              >
                <FileText
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                View Submitted Document
                <ExternalLink size={16} className="ml-1 opacity-70" />
              </button>
            )}
            {submission.text && (
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                  Written Answer:
                </p>
                <p className="text-sm text-gray-200 whitespace-pre-wrap">
                  {submission.text}
                </p>
              </div>
            )}

            <div className="pt-2">
              <label className="text-sm font-medium text-gray-300 ml-1">
                Marks Awarded{" "}
                {totalMarks ? (
                  <span className="text-gray-500">(Out of {totalMarks})</span>
                ) : (
                  ""
                )}
              </label>
              <input
                type="number"
                placeholder="e.g. 85"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-800/80 border border-white/10 p-3 mt-1 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-600 font-medium"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 ml-1">
                Teacher's Feedback (Optional)
              </label>
              <textarea
                placeholder="Write your feedback here..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="w-full bg-slate-800/80 border border-white/10 p-3 mt-1 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-600 text-sm resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-white/10">
            <button
              onClick={onClose}
              className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || isNextLoading}
              className="py-2.5 px-5 bg-indigo-600/20 border border-indigo-500/50 hover:bg-indigo-600/40 text-indigo-300 font-semibold rounded-xl disabled:opacity-50 transition-all"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
            {hasNext && (
              <button
                onClick={handleSaveAndNext}
                disabled={isLoading || isNextLoading}
                className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 font-semibold rounded-xl disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isNextLoading ? "Saving..." : "Save & Next"}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
