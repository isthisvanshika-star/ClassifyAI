"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  PENDING = "PENDING",
}

export default function EditAttendanceModal({
  isOpen,
  onClose,
  onSuccess,
  attendanceRecord,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  attendanceRecord: any;
}) {
  const [newStatus, setNewStatus] = useState<AttendanceStatus>(attendanceRecord?.status);
  const [isLoading, setIsLoading] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTeacherId(localStorage.getItem("teacherId"));
      // Pre-fill the dropdown with the current status when the modal opens
      setNewStatus(attendanceRecord?.status);
    }
  }, [isOpen, attendanceRecord]);

  const handleUpdate = async () => {
    if (!teacherId) {
      toast.error("Session error. Please log in again.");
      return;
    }
    if (!newStatus || newStatus === attendanceRecord.status) {
      toast.error("Please select a new status.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Updating status...");
    try {
      const response = await fetch('/api/teacher/past-attendance/edit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendanceId: attendanceRecord.id,
          teacherId: teacherId,
          newStatus: newStatus,
        }),
      });

      const data = await response.json();
      toast.dismiss(toastId);

      if (!response.ok) {
        throw new Error(data.error || "Failed to update status.");
      }

      toast.success("Attendance status updated successfully!");
      onSuccess(); // Triggers a refresh on the main page
      onClose();   // Closes the modal

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
          className="bg-gray-800 border border-gray-700 p-8 rounded-lg shadow-xl w-full max-w-md text-white"
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-indigo-400 mb-2">Edit Attendance</h2>
          <div className="text-gray-400 mb-6 text-sm">
            <p>Student: <span className="font-semibold text-gray-200">{attendanceRecord.studentName}</span></p>
            <p>Subject: <span className="font-semibold text-gray-200">{attendanceRecord.subjectName}</span></p>
            <p>Date: <span className="font-semibold text-gray-200">{new Date(attendanceRecord.markedAt).toLocaleDateString()}</span></p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">Change Status</label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as AttendanceStatus)} className="w-full bg-gray-700 p-3 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none mt-1">
                <option value={AttendanceStatus.PRESENT}>Present</option>
                <option value={AttendanceStatus.ABSENT}>Absent</option>
                <option value={AttendanceStatus.LATE}>Late</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-700">
            <button onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 font-semibold rounded-lg transition-colors">Cancel</button>
            <button onClick={handleUpdate} disabled={isLoading} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-lg disabled:bg-indigo-400 transition-colors">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}