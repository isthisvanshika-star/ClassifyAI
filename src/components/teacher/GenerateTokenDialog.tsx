"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Subject, Semester, Student, Section } from "@/lib/types";
import {
  getCurrentLocation,
  showErrorMessage,
  showLoadingMessage,
  showSuccessMessage,
} from "@/lib/helper";

export default function GenerateTokenDialog({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFetchingStudents, setIsFetchingStudents] = useState(false);
  const [mode, setMode] = useState<"OFFLINE" | "ONLINE">("OFFLINE"); // ADDED: State for online/offline mode

  // Preselect all students when fetched
  useEffect(() => {
    if (students && students.length > 0) {
      setSelectedStudents(students.map((s) => s.id));
    }
  }, [students]);

  useEffect(() => {
    if (!isOpen) return;

    setError("");
    setSuccess("");
    setSelectedStudents([]);

    async function fetchData() {
      try {
        const [subjectsRes, semestersRes, sectionsRes] = await Promise.all([
          fetch("/api/teacher/subjects/all"),
          fetch("/api/teacher/semester/all"),
          fetch("/api/teacher/sections/all"),
        ]);
        if (!subjectsRes.ok || !semestersRes.ok || !sectionsRes.ok)
          throw new Error("Failed to load initial data.");

        const subjectsData = await subjectsRes.json();
        const semestersData = await semestersRes.json();
        const sectionsData = await sectionsRes.json();

        setSubjects(subjectsData);
        setSemesters(semestersData);
        setSections(sectionsData);

        if (subjectsData.length > 0) setSelectedSubject(subjectsData[0].id);
        if (semestersData.length > 0) setSelectedSemester(semestersData[0].id);
        if (sectionsData.length > 0) setSelectedSection(sectionsData[0].id);
      } catch (err: any) {
        setError(err.message);
      }
    }
    fetchData();
  }, [isOpen]);

  useEffect(() => {
    if (!selectedSemester || !selectedSection) return;

    async function fetchStudents() {
      setIsFetchingStudents(true);
      setStudents([]);
      setSelectedStudents([]);
      try {
        const res = await fetch(
          `/api/teacher/semester/students?semesterId=${selectedSemester}&sectionId=${selectedSection}`
        );
        if (!res.ok) throw new Error("Failed to fetch students.");
        const data = await res.json();
        setStudents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsFetchingStudents(false);
      }
    }
    fetchStudents();
  }, [selectedSemester, selectedSection]);

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    showLoadingMessage("Getting your location...");
    const teacherUserId = localStorage.getItem("teacherId");
    if (!teacherUserId) {
      setError("Could not find teacher ID. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      let location = null;
      // Only get location if the mode is OFFLINE
      if (mode === "OFFLINE") {
        location = await getCurrentLocation();
        showLoadingMessage("Location found. Generating tokens...");
      }
      const response = await fetch("/api/attendance/create-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: selectedSubject,
          studentIds: selectedStudents,
          teacherUserId,
          sectionId: selectedSection,
          location: location,
          mode: mode,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        showErrorMessage(data.message);
        throw new Error(data.message);
      }

      setSuccess("Tokens sent successfully! Starting session...");
      showSuccessMessage("Tokens sent successfully!");
      setTimeout(() => {
        onSuccess(data.classSessionId);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="from-gray-950 via-gray-700 to-gray-950 bg-gradient-to-tl text-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-cyan-500/30"
            initial={{ opacity: 0, scale: 0.85, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">
              Generate & Send QR Codes
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full appearance-none bg-gray-800 border border-cyan-500/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-cyan-400"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id} className="bg-gray-900">
                        {s.name} {s.code && `(${s.code})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full appearance-none bg-gray-800 border border-cyan-500/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-cyan-400"
                  >
                    {semesters.map((s) => (
                      <option key={s.id} value={s.id} className="bg-gray-900">
                        {s.name.includes("Semester")
                          ? s.name
                          : `Semester ${s.name}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Section
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="w-full appearance-none bg-gray-800 border border-cyan-500/30 rounded-lg p-2 text-white focus:ring-2 focus:ring-cyan-400"
                  >
                    {sections.map((s) => (
                      <option key={s.id} value={s.id} className="bg-gray-900">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Students */}
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Select Students ({selectedStudents.length} selected)
                </label>
                {isFetchingStudents ? (
                  <p className="text-gray-400 p-2">Loading students...</p>
                ) : (
                  <div className="mt-2 border grid grid-cols-2 justify-evenly border-cyan-500/20 rounded-lg max-h-60 overflow-y-auto p-2 space-y-1 bg-gray-800/60">
                    {students.length > 0 ? (
                      students.map((student, index) => (
                        <motion.div
                          key={student.id}
                          className="flex items-center p-2 hover:bg-gray-700 rounded-md"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <input
                            type="checkbox"
                            id={`student-${student.id}`}
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => handleStudentSelect(student.id)}
                            className="h-4 w-4 text-cyan-400 border-gray-500 rounded focus:ring-cyan-500"
                          />
                          <label
                            htmlFor={`student-${student.id}`}
                            className="ml-3 text-sm text-gray-200 cursor-pointer"
                          >
                            {student.user.name}
                          </label>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-gray-400 p-2">
                        No students found for this semester/section.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Messages */}
              {error && (
                <p className="text-red-400 text-sm bg-red-900/30 p-3 rounded-md">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-green-400 text-sm bg-green-900/30 p-3 rounded-md">
                  {success}
                </p>
              )}
              <div className="relative w-full bg-transparent ring-1 h-10 ring-cyan-800 rounded-lg p-1 flex">
                {/* Buttons */}
                <button
                  type="button"
                  onClick={() => setMode("OFFLINE")}
                  className={`relative uppercase w-1/2 text-sm transition-all duration-300 rounded-lg ${mode === "OFFLINE" ? "font-semibold bg-cyan-700  text-white z-10" : "text-gray-200"} `}
                >
                  Offline Mode
                </button>
                <button
                  type="button"
                  onClick={() => setMode("ONLINE")}
                  className={`relative uppercase w-1/2 text-sm transition-all duration-300 rounded-lg ${mode === "ONLINE" ? "font-semibold bg-cyan-700 text-white z-10" : "text-gray-200"} `}
                >
                  Online Mode
                </button>
              </div>
              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-4 bg-gray-700 text-gray-200 font-semibold rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || selectedStudents.length === 0}
                  className="py-2 px-4 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition disabled:bg-cyan-800"
                >
                  {isLoading ? "Sending..." : "Generate & Send Emails"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
