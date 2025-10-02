"use client";

import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { Clock, Check, Award, FileText } from "lucide-react";
import SubmitAssignmentModal from "@/components/student/SubmitAssignmentModal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Helper component for the status badge
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

export default function StudentAssignmentsPage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [campusId, setCampusId] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(
    null
  ); // State to control the modal

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

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-indigo-400">Your Assignments</h1>
        <p className="mt-2 text-gray-400">
          Keep track of your due dates and grades.
        </p>
      </header>

      {isLoading && (
        <p className="text-center text-gray-400 animate-pulse">
          Loading assignments...
        </p>
      )}
      {error && (
        <p className="text-center text-red-400">Failed to load assignments.</p>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 mt-16">
              You have no assignments right now.
            </p>
          ) : (
            assignments.map((assignment: any) => (
              <div
                key={assignment.id}
                className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-white pr-4">
                      {assignment.title}
                    </h3>
                    <StatusBadge status={assignment.submissionStatus} />
                  </div>
                  <p className="text-sm text-gray-400">
                    {assignment.subjectName}
                  </p>
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
                      <span className="font-semibold text-green-400">
                        {assignment.grade}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedAssignment(assignment)} // Set the selected assignment to open the modal
                    disabled={assignment.submissionStatus !== "PENDING"}
                    className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
                  >
                    {assignment.submissionStatus === "PENDING"
                      ? "Submit Now"
                      : "View Details"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
          {selectedAssignment && (
          <SubmitAssignmentModal
            isOpen={!!selectedAssignment}
            onClose={() => setSelectedAssignment(null)}
            onSuccess={() => {
                mutate(); // Re-fetch the assignment list to update status
                setSelectedAssignment(null);
            }}
            assignment={selectedAssignment}
          />
      )}
    </main>

  );
}
