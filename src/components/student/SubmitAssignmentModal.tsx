"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, File as FileIcon } from "lucide-react";

export default function SubmitAssignmentModal({
  isOpen,
  onClose,
  onSuccess,
  assignment,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assignment: any; // The assignment object
}) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [campusId, setCampusId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Get the IDs when the modal opens
      setStudentId(localStorage.getItem("studentId"));
      setCampusId(localStorage.getItem("CampusID"));
      // Reset form state
      setFile(null);
      setText("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!studentId || !campusId) {
      toast.error("Session error. Please log in again.");
      return;
    }
    if (!file && !text.trim()) {
      toast.error("You must submit a file or add a text comment.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Submitting your assignment...");

    // We must use FormData to send a file
    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append("campusId", campusId);
    formData.append("assignmentId", assignment.id);
    if (file) {
      formData.append("file", file);
    }
    if (text) {
      formData.append("text", text);
    }

    try {
      const response = await fetch('/api/student/submissions', {
        method: 'POST',
        // IMPORTANT: Do not set 'Content-Type' header when using FormData.
        // The browser will set it automatically with the correct boundary.
        body: formData,
      });

      const data = await response.json();
      toast.dismiss(toastId);

      if (!response.ok) {
        throw new Error(data.error || "Submission failed.");
      }

      toast.success("Assignment submitted successfully!");
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gray-800 border border-gray-700 p-8 rounded-lg shadow-xl w-full max-w-lg text-white"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-indigo-400 mb-2">Submit Assignment</h2>
          <p className="text-gray-400 mb-6 text-sm">{assignment.title}</p>

          <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Upload File (PDF, DOCX, etc.)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-500" />
                        <div className="flex text-sm text-gray-400">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 px-2">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file" type="file" className="sr-only" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                            </label>
                        </div>
                        {file && <p className="text-xs text-green-400 pt-2 flex items-center gap-2"><FileIcon size={14}/> {file.name}</p>}
                    </div>
                </div>
            </div>

            <textarea placeholder="Or add a text submission/comment..." value={text} onChange={(e) => setText(e.target.value)} rows={4} className="w-full bg-gray-700 p-3 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
          </div>

          <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-700">
            <button onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 font-semibold rounded-lg transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={isLoading} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-lg disabled:bg-indigo-400 transition-colors">
              {isLoading ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}