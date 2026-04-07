"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function GradeSubmissionModal({
  isOpen,
  onClose,
  onSuccess,
  submission,
  totalMarks,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  submission: any;
  totalMarks: number | null;
}) {
  const [grade, setGrade] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTeacherId(localStorage.getItem("teacherId"));
      setGrade(submission?.grade?.toString() || "");
      setFeedback(submission?.feedback || "");
    }
  }, [isOpen, submission]);

  const handleSubmit = async () => {
    if (!teacherId) {
      toast.error("Session error. Please log in again.");
      return;
    }
    if (grade === "" || isNaN(parseFloat(grade))) {
        toast.error("Please enter a valid grade.");
        return;
    }
 //seting loading state to true
    setIsLoading(true);
    const toastId = toast.loading("Saving grade...");
    try {
      const response = await fetch('/api/teacher/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          teacherId: teacherId,
          grade: parseFloat(grade),
          feedback,
        }),
      });

      const data = await response.json();
      toast.dismiss(toastId);
      if (!response.ok) throw new Error(data.error || "Failed to save grade.");

      toast.success("Grade saved successfully!");
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
        className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gray-800 border border-gray-700 p-8 rounded-lg shadow-xl w-full max-w-lg text-white"
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-indigo-400 mb-2">Grade Submission</h2>
          <p className="text-gray-400 mb-6 text-sm">Student: {submission?.student?.user?.name}</p>

          <div className="space-y-4">
            {submission.fileUrl && (
              <Link href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-gray-700 hover:bg-gray-600 p-3 rounded-md text-indigo-300 font-semibold transition-colors">
                View Submitted File
              </Link>
            )}
            <div>
              <label className="text-sm text-gray-400">Grade {totalMarks ? `(out of ${totalMarks})` : ''}</label>
              <input type="number" placeholder="Enter grade" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full bg-gray-700 p-3 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none mt-1" />
            </div>
            <textarea placeholder="Feedback (Optional)" value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} className="w-full bg-gray-700 p-3 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
          </div>

          <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-700">
            <button onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 font-semibold rounded-lg transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={isLoading} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-lg disabled:bg-indigo-400 transition-colors">
              {isLoading ? 'Saving...' : 'Save Grade'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}