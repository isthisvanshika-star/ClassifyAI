"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Clock, Check, Award, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SubmitAssignmentModal from "@/components/student/SubmitAssignmentModal";
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
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(
    null
  );
const router = useRouter();
  useEffect(() => {
    setStudentId(localStorage.getItem("studentId"));
    setCampusId(localStorage.getItem("CampusID"));
  }, []);

  const { data, error, isLoading, mutate } = useSWR(
    studentId && campusId
      ? `/api/student/assignments?studentId=${studentId}&campusId=${campusId}`
      : null,
    fetcher
  );

  const assignments = data?.assignments || [];
console.log({data})
  return (
    <main className="min-h-screen bg-transparent p-8 text-white">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-cyan-400">
          Your Assignments
        </h1>
        <p className="mt-2 text-gray-400 text-sm">
          Keep track of your due dates and grades.
        </p>
      </header>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <AssignmentCardSkeleton key={idx} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-center text-red-400">
          Failed to load assignments. Please refresh.
        </p>
      )}

      {/* Assignments List with Framer Motion */}
      {!isLoading && !error && (
        <AnimatePresence>
          {assignments.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 mt-16">
              You have no assignments right now.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map((assignment: any) => (
                <motion.div
                  key={assignment.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-transparent backdrop-blur-lg p-6 rounded-2xl border border-gray-700 flex flex-col justify-between shadow-lg hover:shadow-cyan-500/30 transition-shadow duration-300"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-cyan-300 pr-4">
                        {assignment.title}
                      </h3>
                      <StatusBadge status={assignment.submissionStatus} />
                    </div>
                    <p className="text-sm text-gray-400">{assignment.subjectName}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Due:{" "}
                      {assignment.dueDate
                        ? new Date(assignment.dueDate).toLocaleDateString()
                        : "No due date"}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-700 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Total Marks</span>
                      <span className="font-semibold">
                        {assignment.totalMarks || "N/A"}
                      </span>
                    </div>
                    {assignment.submissionStatus === "GRADED" && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Your Grade</span>
                        <span className="font-semibold text-green-400">{assignment.grade}</span>
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      disabled={assignment.submissionStatus !== "PENDING"}
                      className={`w-full mt-2 py-2 font-semibold rounded-lg transition ${
                        assignment.submissionStatus === "PENDING"
                          ? "bg-cyan-500 hover:bg-cyan-400 text-black"
                          : "bg-gray-700 cursor-not-allowed text-gray-400"
                      }`}
                    >
                      {assignment.submissionStatus === "PENDING"
                        ? "Submit Now"
                        : "View Details"}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}

      {/* Submit Assignment Modal */}
      {selectedAssignment && (
        <SubmitAssignmentModal
          isOpen={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onSuccess={() => {
            mutate();
            setSelectedAssignment(null);
          }}
          assignment={selectedAssignment}
        />
      )}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => router.push("/dashboard/student")}
          className="flex items-center justify-center gap-2 rounded-full  text-white hover:text-cyan-300 transition-colors"
        >
          <ChevronLeft size={40} />
        </button>
      </div>
    </main>
  );
}
