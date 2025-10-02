"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { Clock, CheckCircle, BarChart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GradeSubmissionModal from "@/components/teacher/GradeSubmissionModal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AssignmentDetailPage() {
  const params = useParams();
  const assignmentId = params.assignmentId;
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [campusId, setCampusId] = useState<string | null>(null);
  const [submissionToGrade, setSubmissionToGrade] = useState<any | null>(null);

  useEffect(() => {
    setTeacherId(localStorage.getItem("teacherId"));
    setCampusId(localStorage.getItem("CampusID"));
  }, []);

  // Fetch 1: Assignment
  const {
    data: assignmentData,
    error: assignmentError,
    isLoading: assignmentLoading,
    mutate: mutateAssignment,
  } = useSWR(
    assignmentId && teacherId && campusId
      ? `/api/teacher/assignments?assignmentId=${assignmentId}&teacherId=${teacherId}&campusId=${campusId}`
      : null,
    fetcher
  );

  // Fetch 2: Analytics
  const {
    data: analyticsData,
    error: analyticsError,
    isLoading: analyticsLoading,
  } = useSWR(
    assignmentId && teacherId
      ? `/api/teacher/assignments/analytics?assignmentId=${assignmentId}&teacherId=${teacherId}`
      : null,
    fetcher
  );

  const isLoading = assignmentLoading || analyticsLoading;
  const error = assignmentError || analyticsError;
  const assignment = assignmentData?.assignment;
  const analytics = analyticsData?.analytics;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="animate-pulse bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
        >
          Loading assignment details...
        </motion.div>
      </div>
    );
  }

  if (error || !assignmentData?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 text-lg">
        Error: {assignmentData?.error || "Failed to load assignment."}
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 text-white">
      {/* Header */}
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <Link
          href="/dashboard/teacher/assignments"
          className="text-sm text-cyan-400 hover:underline mb-4 inline-block"
        >
          &larr; Back to All Assignments
        </Link>
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
          {assignment.title}
        </h1>
        <div className="flex flex-wrap gap-4 mt-3 text-gray-400 text-sm">
          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm">
            {assignment.subject.name}
          </span>
          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm">
            Due:{" "}
            {assignment.dueDate
              ? new Date(assignment.dueDate).toLocaleString()
              : "No due date"}
          </span>
          <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm">
            Max Marks: {assignment.totalMarks || "N/A"}
          </span>
        </div>
      </motion.header>

      {/* Analytics Section */}
      {analytics && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 p-6 rounded-2xl border border-gray-800 shadow-lg bg-white/5 backdrop-blur-lg"
        >
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            <BarChart className="text-cyan-400" size={24} /> Analytics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-5 rounded-xl bg-white/10 backdrop-blur-sm shadow-md"
            >
              <p className="text-sm text-gray-400">Submission Rate</p>
              <p className="text-2xl font-bold text-cyan-300">
                {analytics.submissionCount} / {analytics.totalStudents}
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-5 rounded-xl bg-white/10 backdrop-blur-sm shadow-md"
            >
              <p className="text-sm text-gray-400">Highest Grade</p>
              <p className="text-2xl font-bold text-green-400">
                {analytics.highestGrade ?? "N/A"}
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-5 rounded-xl bg-white/10 backdrop-blur-sm shadow-md"
            >
              <p className="text-sm text-gray-400">Lowest Grade</p>
              <p className="text-2xl font-bold text-red-400">
                {analytics.lowestGrade ?? "N/A"}
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-5 rounded-xl bg-white/10 backdrop-blur-sm shadow-md"
            >
              <p className="text-sm text-gray-400">Not Submitted</p>
              <p className="text-2xl font-bold text-yellow-400">
                {analytics.nonSubmitters.length}
              </p>
            </motion.div>
          </div>

          {analytics.nonSubmitters.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-400">
                Students who haven&apos;t submitted:
              </p>
              <div className="flex flex-wrap gap-2 mt-2 text-xs">
                {analytics.nonSubmitters.map((student: any) => (
                  <span
                    key={student.id}
                    className="bg-red-900/40 text-red-300 px-3 py-1 rounded-lg shadow-sm backdrop-blur-sm"
                  >
                    {student.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.section>
      )}

      {/* Submissions */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold mb-5 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          Student Submissions ({assignment.submissions.length})
        </h2>

        <div className="rounded-2xl border border-gray-800 shadow-lg bg-white/5 backdrop-blur-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-cyan-600/60 to-purple-600/60 text-xs text-gray-200 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3">Submitted At</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Grade</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {assignment.submissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-16 text-gray-500 italic"
                  >
                    No submissions yet.
                  </td>
                </tr>
              ) : (
                assignment.submissions.map((submission: any) => {
                  const isLate =
                    assignment.dueDate &&
                    new Date(submission.submittedAt) >
                      new Date(assignment.dueDate);

                  return (
                    <motion.tr
                      key={submission.id}
                      whileHover={{ scale: 1.01 }}
                      className="hover:bg-white/10 backdrop-blur-sm transition"
                    >
                      <td className="px-6 py-4 font-medium text-white">
                        {submission.student.user.name}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            isLate
                              ? "bg-red-500/20 text-red-400"
                              : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {isLate ? (
                            <Clock size={14} />
                          ) : (
                            <CheckCircle size={14} />
                          )}
                          {isLate ? "Late" : "On Time"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {submission.grade !== null
                          ? `${submission.grade} / ${assignment.totalMarks}`
                          : "Not Graded"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSubmissionToGrade(submission)}
                          className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 transition text-white font-bold py-1.5 px-4 rounded-lg text-sm shadow-md"
                        >
                          {submission.grade !== null ? "Edit Grade" : "Grade"}
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.section>

      {submissionToGrade && (
        <GradeSubmissionModal
          isOpen={!!submissionToGrade}
          onClose={() => setSubmissionToGrade(null)}
          onSuccess={() => {
            mutateAssignment();
          }}
          submission={submissionToGrade}
          totalMarks={assignment.totalMarks}
        />
      )}
    </main>
  );
}
