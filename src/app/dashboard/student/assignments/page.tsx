"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import {
  Clock,
  Check,
  Award,
  ChevronLeft,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const StatusBadge = ({ status }: { status: string }) => {
  type AssignmentStatus = "PENDING" | "SUBMITTED" | "GRADED";
  const statusInfo = {
    PENDING: {
      text: "PENDING",
      color: "bg-yellow-500/20 text-yellow-300",
      icon: <Clock size={14} />,
    },
    SUBMITTED: {
      text: "SUBMITTED",
      color: "bg-blue-500/20 text-blue-300",
      icon: <Check size={14} />,
    },
    GRADED: {
      text: "GRADED",
      color: "bg-green-500/20 text-green-300",
      icon: <Award size={14} />,
    },
  };
  const currentStatus =
    statusInfo[status as AssignmentStatus] || statusInfo.PENDING;

  return (
    <span
      className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 ${currentStatus.color}`}
    >
      {currentStatus.icon}
      {currentStatus.text}
    </span>
  );
};

// Skeleton Loader for Assignment Card
const AssignmentCardSkeleton = () => (
  <div className="bg-[#1B1F2B] p-6 rounded-2xl border border-gray-700 shadow animate-pulse h-64" />
);

export default function StudentAssignmentsPage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [campusId, setCampusId] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    setStudentId(localStorage.getItem("studentId"));
    setCampusId(localStorage.getItem("CampusID"));
  }, []);

  const { data, error, isLoading, mutate } = useSWR(
    studentId && campusId
      ? `/api/student/assignments?studentId=${studentId}&campusId=${campusId}`
      : null,
    fetcher,
  );

  const assignments = data?.assignments || [];
  return (
    <main className="min-h-screen bg-transparent p-6 md:p-8 relative text-white">
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => router.push("/dashboard/student")}
          className="flex items-center justify-center p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-lg hover:bg-cyan-500/20 hover:border-cyan-400 text-white transition-all duration-300"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
      <header className="mb-12 mt-4 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Your Assignments
        </h1>
        <p className="mt-3 text-gray-400 text-sm md:text-base max-w-lg mx-auto">
          Keep track of your due dates, submissions, and grades.
        </p>
      </header>
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {[...Array(6)].map((_, idx) => (
            <AssignmentCardSkeleton key={idx} />
          ))}
        </div>
      )}
      {error && (
        <div className="flex justify-center relative z-10">
          <p className="text-center text-red-400 bg-red-500/10 px-6 py-3 rounded-xl border border-red-500/30">
            Failed to load assignments. Please refresh.
          </p>
        </div>
      )}

      {/* Assignments List with Framer Motion */}
      {!isLoading && !error && (
        <AnimatePresence>
          {assignments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center mt-16 relative z-10"
            >
              <p className="text-center text-gray-400 bg-white/5 px-8 py-4 rounded-2xl border border-white/10">
                You have no assignments right now. Chill!
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {assignments.map((assignment: any) => (
                <motion.div
                  key={assignment.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 flex flex-col justify-between shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:border-cyan-500/30 transition-all duration-300 group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight">
                        {assignment.title}
                      </h3>
                      <StatusBadge status={assignment.submissionStatus} />
                    </div>
                    <p className="text-sm font-medium text-cyan-500/80 mb-1">
                      {assignment.subjectName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-3 bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/5">
                      <CalendarDays
                        size={14}
                        className={
                          new Date(assignment.dueDate) < new Date()
                            ? "text-red-400"
                            : "text-cyan-400"
                        }
                      />
                      <span
                        className={
                          new Date(assignment.dueDate) < new Date()
                            ? "text-red-400"
                            : ""
                        }
                      >
                        Due:{" "}
                        {assignment.dueDate
                          ? new Date(assignment.dueDate).toLocaleDateString()
                          : "No due date"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Total Marks</span>
                      <span className="font-semibold text-white bg-white/10 px-2 py-1 rounded">
                        {assignment.totalMarks || "N/A"}
                      </span>
                    </div>

                    {assignment.submissionStatus === "GRADED" && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Your Grade</span>
                        <span className="font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                          {assignment.grade}
                        </span>
                      </div>
                    )}

                    {/* THE SMART SINGLE BUTTON */}
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/student/assignments/questions?assignmentId=${assignment.id}`,
                        )
                      }
                      className={`w-full mt-2 py-3 px-4 font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg active:scale-[0.98] border ${
                        assignment.submissionStatus === "PENDING"
                          ? "bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white border-cyan-400/30 shadow-cyan-500/20"
                          : assignment.submissionStatus === "SUBMITTED"
                            ? "bg-slate-800 text-cyan-400 border-cyan-500/30 hover:bg-slate-700"
                            : "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                      }`}
                    >
                      {assignment.submissionStatus === "PENDING" &&
                        "View & Submit"}
                      {assignment.submissionStatus === "SUBMITTED" &&
                        "View Submission"}
                      {assignment.submissionStatus === "GRADED" &&
                        "View Feedback"}
                      <ArrowRight
                        size={18}
                        className={
                          assignment.submissionStatus === "PENDING"
                            ? "group-hover:translate-x-1 transition-transform"
                            : ""
                        }
                      />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}
    </main>
  );
}
