"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Book, Trophy, TrendingUp, Users, Download } from "lucide-react";
import { motion } from "framer-motion";
import { showErrorMessage, showLoadingMessage, showSuccessMessage, toastDissmisser } from "@/lib/helper";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.97 }}
    className="p-6 rounded-2xl border border-gray-700 shadow-lg bg-gray-800/40 backdrop-blur-xl flex items-start gap-4 transition-all"
  >
    <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  </motion.div>
);

export default function TeacherAnalyticsPage() {
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [campusId, setCampusId] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  useEffect(() => {
    setTeacherId(localStorage.getItem("teacherId"));
    setCampusId(localStorage.getItem("CampusID"));
  }, []);

  const { data, error, isLoading } = useSWR(
    teacherId && campusId
      ? `/api/teacher/analytics/assignments?teacherId=${teacherId}&campusId=${campusId}`
      : null,
    fetcher
  );

 const handleExport = async () => {
 const toastId = showLoadingMessage("Preparing your export...");
  setExportLoading(true);
  if (!teacherId) return;

  try {
    const res = await fetch(`/api/teacher/analytics/export?teacherId=${teacherId}`);

    if (!res.ok) {
      toastDissmisser(toastId);
      showErrorMessage("Failed to export data. Please try again.");
      setExportLoading(false);
      throw new Error("Failed to download file");
    }
    const blob = await res.blob();
    const contentDisposition = res.headers.get("Content-Disposition");
    let fileName = "export.csv";

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match) fileName = match[1];
    }
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;

    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    toastDissmisser(toastId);
    showSuccessMessage("Export successful.");
    setExportLoading(false);
  } catch (err) {
      toastDissmisser(toastId);
      showErrorMessage("An error occurred during export. Please try again.");
    setExportLoading(false);
    console.error("Download error:", err);
  }finally{
    setExportLoading(false);
  }
};

  const analytics = data?.analytics;

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 text-white">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Header Skeleton */}
          <div className="space-y-3">
            <div className="h-10 w-1/3 bg-gray-700/60 rounded-lg animate-pulse"></div>
            <div className="h-4 w-1/2 bg-gray-700/50 rounded-lg animate-pulse"></div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-gray-800/40 backdrop-blur-xl border border-gray-700 shadow-lg space-y-4 animate-pulse"
              >
                <div className="h-10 w-10 bg-gray-700/70 rounded-xl"></div>
                <div className="h-4 w-1/2 bg-gray-700/60 rounded-lg"></div>
                <div className="h-6 w-1/3 bg-gray-700/50 rounded-lg"></div>
              </div>
            ))}
          </div>

          {/* Detailed Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Table Skeleton */}
            <div className="p-6 rounded-2xl bg-gray-800/40 backdrop-blur-xl border border-gray-700 shadow-lg space-y-4 animate-pulse">
              <div className="h-6 w-1/3 bg-gray-700/60 rounded-lg"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-6 w-full bg-gray-700/50 rounded-lg"
                  ></div>
                ))}
              </div>
            </div>

            {/* Student Trends Skeleton */}
            <div className="p-6 rounded-2xl bg-gray-800/40 backdrop-blur-xl border border-gray-700 shadow-lg space-y-4 animate-pulse">
              <div className="h-6 w-1/2 bg-gray-700/60 rounded-lg"></div>
              <div className="space-y-3 max-h-[400px] overflow-hidden">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-12 w-full bg-gray-700/50 rounded-lg"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-transparent text-red-400 p-8 text-center">
        Failed to load analytics.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-transparent text-white p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <motion.header
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl 2xl:h-[2.6rem] font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Assignment Analytics
          </h1>
          <p className="mt-2 text-gray-400">
            An overview of performance across all your assignments.
          </p>
        </motion.header>

        {/* EXPORT BUTTON */}
        <motion.button
          onClick={handleExport}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 px-6 py-3 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
        >
          {exportLoading? (
            <span className="animate-pulse">Exporting...</span>
          ) : (
            <>
              <Download size={20} />
              Export to Excel
            </>
          )}
        </motion.button>
      </div>

      {/* --- STATS GRID --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        <StatCard
          title="Total Assignments"
          value={analytics.totalAssignments}
          icon={<Book className="text-white" />}
          color="from-indigo-500 via-purple-500 to-pink-500"
        />
        <StatCard
          title="Graded Submissions"
          value={analytics.totalGradedSubmissions}
          icon={<Users className="text-white" />}
          color="from-cyan-500 to-blue-500"
        />
        <StatCard
          title="Top Subject"
          value={analytics.performanceBySubject[0]?.subject || "N/A"}
          icon={<Trophy className="text-white" />}
          color="from-amber-400 to-orange-500"
        />
        <StatCard
          title="Students Tracked"
          value={analytics.trendsByStudent.length}
          icon={<TrendingUp className="text-white" />}
          color="from-emerald-400 to-green-600"
        />
      </motion.div>

      {/* --- DETAILED ANALYTICS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance by Subject */}
        <motion.section
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800/40 border border-gray-700 rounded-2xl shadow-lg backdrop-blur-xl p-6"
        >
          <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
            Performance by Subject
          </h2>
          <div className="overflow-hidden rounded-xl border border-gray-700">
            <table className="w-full text-left">
              <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase">
                <tr>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3 text-right">Average Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {analytics.performanceBySubject.length > 0 ? (
                  analytics.performanceBySubject.map((item: any) => (
                    <tr key={item.subject} className="hover:bg-gray-700/40">
                      <td className="px-6 py-4 font-medium">{item.subject}</td>
                      <td className="px-6 py-4 text-right font-semibold text-cyan-400">
                        {item.averageGrade}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="text-center py-8 text-gray-500">
                      No graded assignments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Student Grade Trends */}
        <motion.section
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800/40 border border-gray-700 rounded-2xl shadow-lg backdrop-blur-xl p-6"
        >
          <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
            Student Grade Trends
          </h2>
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <ul className="divide-y divide-gray-700">
              {analytics.trendsByStudent.length > 0 ? (
                analytics.trendsByStudent.map((student: any) => (
                  <li
                    key={student.studentName}
                    className="p-4 hover:bg-gray-700/40 rounded-lg transition"
                  >
                    <p className="font-semibold text-white">
                      {student.studentName}
                    </p>
                    <p className="text-xs text-gray-400">
                      Grades: {student.grades.join(", ")}
                    </p>
                  </li>
                ))
              ) : (
                <li className="text-center py-8 text-gray-500">
                  No graded assignments yet.
                </li>
              )}
            </ul>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
