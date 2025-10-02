"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AssignmentStatus } from "@/lib/types";
import {
  showErrorMessage,
  showLoadingMessage,
  showSuccessMessage,
  toastDissmisser,
} from "@/lib/helper";
import { PlusCircle, Trash2 } from "lucide-react";

export default function CreateAssignmentModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<string[]>([""]); // dynamic list
  const [dueDate, setDueDate] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [status, setStatus] = useState<AssignmentStatus>("DRAFT");
  const [rubric, setRubric] = useState("");

  const [teacherSubjects, setTeacherSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reset + fetch subjects when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setQuestions([""]);
      setDueDate("");
      setTotalMarks("");
      setStatus("DRAFT");
      setRubric("");

      const teacherUserId = localStorage.getItem("teacherId");
      const campusId = localStorage.getItem("CampusID");
      if (teacherUserId && campusId) {
        const fetchSubjects = async () => {
          const res = await fetch(
            `/api/teacher/subjects?teacherId=${teacherUserId}&campusId=${campusId}`
          );
          if (res.ok) {
            const data = await res.json();
            setTeacherSubjects(data);
            if (data.length > 0) {
              setSelectedSubject(data[0].subject.id);
            }
          }
        };
        fetchSubjects();
      }
    }
  }, [isOpen]);

  // Add new question
  const addQuestion = () => {
    setQuestions([...questions, ""]);
  };

  // Remove question
  const removeQuestion = (index: number) => {
    if (questions.length === 1) return; // keep at least 1
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // Update question text
  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    const teacherUserId = localStorage.getItem("teacherId");
    const campusId = localStorage.getItem("CampusID");

    if (!title || !selectedSubject || !teacherUserId || !campusId || !totalMarks) {
      showErrorMessage("Please fill in all required fields.");
      return;
    }

    if (questions.some((q) => !q.trim())) {
      showErrorMessage("Please remove empty questions or fill them in.");
      return;
    }

    setIsLoading(true);
    const toastId = showLoadingMessage("Creating assignment...");
    try {
      const response = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: JSON.stringify(questions), // send as JSON array
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          subjectId: selectedSubject,
          teacherId: teacherUserId,
          campusId,
          totalMarks: totalMarks ? parseInt(totalMarks) : null,
          status,
          rubric,
        }),
      });

      const data = await response.json();
      toastDissmisser(toastId);

      if (!response.ok) {
        throw new Error(data.error || "Failed to create assignment.");
      }

      showSuccessMessage("Assignment created successfully!");
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
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gray-900/10 backdrop-blur-xl border border-indigo-500/30 p-8 rounded-2xl shadow-2xl w-full max-w-xl text-white relative"
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-6">
            New Assignment
          </h2>

          {/* Scrollable form */}
          <div className="space-y-4 max-h-[65vh] py-1 pl-1 overflow-y-auto pr-2 custom-scrollbar">
            <input
              type="text"
              placeholder="Assignment Title (eg. Linear Algebra Assignment 1)"
              value={title}
              required
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-800/70 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />

            {/* Dynamic Questions */}
            <div>
              <label className="text-sm text-gray-400">Questions</label>
              <div className="space-y-3 mt-2">
                {questions.map((q, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <textarea
                      placeholder={`Q${i + 1}. Enter your question...`}
                      value={q}
                      onChange={(e) => updateQuestion(i, e.target.value)}
                      rows={2}
                      className="flex-1 bg-gray-800/70 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => removeQuestion(i)}
                      className="p-2 mt-5 bg-red-600/70 hover:bg-red-500 rounded-lg text-white"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600/70 hover:bg-indigo-500 rounded-lg font-semibold text-sm"
                >
                  <PlusCircle size={16} /> Add Question
                </button>
              </div>
            </div>

            {/* Marks + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Total Marks</label>
                <input
                  type="number"
                  placeholder="e.g., 100"
                  value={totalMarks}
                  required
                  onChange={(e) => setTotalMarks(e.target.value)}
                  className="w-full bg-gray-800/70 p-3 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AssignmentStatus)}
                  className="w-full [appearance:none] [&::-ms-expand]:hidden bg-gray-800/70 p-3 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>

            {/* Rubric */}
            <label className="text-sm text-gray-400">Grading Criteria / Rubric</label>
            <textarea
             placeholder="eg. Accuracy – 10 marks, Steps – 5 marks, Presentation – 5 marks"
              value={rubric}
              onChange={(e) => setRubric(e.target.value)}
              rows={3}
              className="w-full bg-gray-800/70 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
            ></textarea>

            {/* Subject */}
            <div>
              <label className="text-sm text-gray-400">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full [appearance:none] [&::-ms-expand]:hidden bg-gray-800/70 p-3 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              >
                {teacherSubjects.map((ts) => (
                  <option key={ts.id} value={ts.subject.id}>
                    {ts.subject.name} (
                    {ts.semester.name.includes("Semester")
                      ? ts.semester.name
                      : `${ts.semester.name} Semester`}
                    , {ts.section.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-sm text-gray-400">Due Date (Optional)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-gray-800/70 p-3 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-800">
            <button
              onClick={onClose}
              className="py-2 px-5 bg-gray-700/70 hover:bg-gray-600 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="py-2 px-5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:scale-105 transition-transform rounded-lg font-bold shadow-lg disabled:opacity-60"
            >
              {isLoading ? "Creating..." : "Create Assignment"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
