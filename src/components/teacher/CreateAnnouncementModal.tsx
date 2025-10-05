"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Semester, Section } from "@/lib/types"; // Assuming these types are in your types file

export default function CreateAnnouncementModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAll, setTargetAll] = useState(true);
  const [targetSemester, setTargetSemester] = useState("");
  const [targetSection, setTargetSection] = useState("");
  
  // State for the dropdown options
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data for the semester and section dropdowns
  useEffect(() => {
    if (isOpen) {
      // Reset form on open
      setTitle("");
      setMessage("");
      setTargetAll(true);
      setTargetSemester("");
      setTargetSection("");

      const campusId = localStorage.getItem("campusId");
      if (campusId) {
        const fetchDropdownData = async () => {
          try {
            const [semestersRes, sectionsRes] = await Promise.all([
              fetch(`/api/teacher/semester/all?campusId=${campusId}`),
              fetch(`/api/teacher/section/all?campusId=${campusId}`),
            ]);
            if (!semestersRes.ok || !sectionsRes.ok) throw new Error("Failed to load data.");
            setSemesters(await semestersRes.json());
            setSections(await sectionsRes.json());
          } catch (error: any) {
            toast.error(error.message);
          }
        };
        fetchDropdownData();
      }
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    const teacherId = localStorage.getItem("teacherId");
    const campusId = localStorage.getItem("campusId");

    if (!title || !message || !teacherId || !campusId) {
      toast.error("Title and message are required.");
      return;
    }
    if (!targetAll && (!targetSemester || !targetSection)) {
        toast.error("Please select a target semester and section.");
        return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Posting announcement...");
    try {
      const response = await fetch('/api/teacher/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          targetAll,
          targetSemester: !targetAll ? parseInt(targetSemester) : null,
          targetSection: !targetAll ? targetSection : null,
          teacherId,
          campusId,
        }),
      });

      const data = await response.json();
      toast.dismiss(toastId);

      if (!response.ok) {
        throw new Error(data.error || "Failed to post announcement.");
      }

      toast.success("Announcement posted successfully!");
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
          <h2 className="text-2xl font-bold text-indigo-400 mb-6">Create New Announcement</h2>
          <div className="space-y-4">
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-700 p-3 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" />
            <textarea placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="w-full bg-gray-700 p-3 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
            
            <div>
                <label className="text-sm font-medium text-gray-300">Target Audience</label>
                <div className="mt-2 flex gap-4 rounded-lg bg-gray-700 p-1">
                    <button onClick={() => setTargetAll(true)} className={`w-1/2 py-2 rounded-md text-sm font-semibold transition ${targetAll ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>All Students</button>
                    <button onClick={() => setTargetAll(false)} className={`w-1/2 py-2 rounded-md text-sm font-semibold transition ${!targetAll ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>Specific Class</button>
                </div>
            </div>

            <AnimatePresence>
            {!targetAll && (
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <select value={targetSemester} onChange={(e) => setTargetSemester(e.target.value)} className="w-full bg-gray-700 p-3 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="">Select Semester</option>
                        {semesters.map(s => <option key={s.id} value={s.number}>{s.name}</option>)}
                    </select>
                    <select value={targetSection} onChange={(e) => setTargetSection(e.target.value)} className="w-full bg-gray-700 p-3 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="">Select Section</option>
                        {sections.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                </motion.div>
            )}
            </AnimatePresence>
          </div>

          <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-700">
            <button onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 font-semibold rounded-lg transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={isLoading} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-lg disabled:bg-indigo-400 transition-colors">
              {isLoading ? 'Posting...' : 'Post Announcement'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}