"use client";

import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { ChevronLeft, ChevronRight, Download, Edit } from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import {
  AttendanceHistoryLoadingSkeleton,
  AttendanceHistoryTableLoadingSkeleton,
} from "@/components/teacher/SkeletonLoaders";
import { motion, AnimatePresence } from "framer-motion";
import { showErrorMessage, showSuccessMessage } from "@/lib/helper";
import EditAttendanceModal from "@/components/teacher/EditAttendanceModal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AttendanceHistoryPage() {
  const [filters, setFilters] = useState({
    subjectId: "",
    semesterId: "",
    sectionId: "",
    date: "",
  });
  const [page, setPage] = useState(1);
  const [teacherSubjects, setTeacherSubjects] = useState<any[]>([]);
  const [recordToEdit, setRecordToEdit] = useState<any | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [campusId, setCampusId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setTeacherId(localStorage.getItem("teacherId"));
    setCampusId(localStorage.getItem("CampusID"));
  }, []);

  useEffect(() => {
    if (teacherId && campusId) {
      const fetchFilterData = async () => {
        const res = await fetch(
          `/api/teacher/subjects?teacherId=${teacherId}&campusId=${campusId}`
        );
        if (res.ok) {
          setTeacherSubjects(await res.json());
        }
      };
      fetchFilterData();
    }
  }, [teacherId, campusId]);

  const handleExport = () => {
    const exportUrl = createApiUrl("/api/teacher/past-attendance/export");
    if (exportUrl) {
      showSuccessMessage("Your download will begin shortly...");
      // Trigger the download
      window.location.href = exportUrl;
    } else {
      showErrorMessage("Could not generate export link. Please refresh.");
    }
  };

  const createApiUrl = (basePath: string) => {
    if (!teacherId || !campusId) return null;
    const params = new URLSearchParams({ teacherId, campusId });
    // Add filters to params
    if (filters.subjectId) params.append("subjectId", filters.subjectId);
    if (filters.date) params.append("date", filters.date);
    // For list view, add pagination
    if (basePath.includes("past-attendance")) {
      params.append("page", page.toString());
      params.append("limit", "15");
    }
    return `${basePath}?${params.toString()}`;
  };

  const { data, error, isLoading } = useSWR(
    hydrated ? createApiUrl("/api/teacher/past-attendance") : null,
    fetcher
  );

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPage(1);
  };

  if (!hydrated) return <AttendanceHistoryLoadingSkeleton />;

  return (
    <main className="min-h-screen bg-transparent text-white p-8">
      {/* Header */}
      <motion.header
        className="mb-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-indigo-400 text-transparent bg-clip-text drop-shadow-md">
          Attendance History
        </h1>
        <p className="mt-2 text-gray-400">
          View and filter past attendance records.
        </p>
      </motion.header>

      {/* Filters */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl border border-cyan-500/30 bg-gray-900/60 backdrop-blur-md shadow-lg shadow-cyan-500/10 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <motion.select
          name="subjectId"
          value={filters.subjectId}
          onChange={handleFilterChange}
          className="w-full bg-gray-800/80 border border-cyan-500/30 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 outline-none transition"
          whileHover={{ scale: 1.03 }}
          whileFocus={{ scale: 1.03 }}
        >
          <option value="">All Subjects</option>
          {[
            ...new Map(
              teacherSubjects.map((item) => [item.subject.id, item.subject])
            ).values(),
          ].map((subject: any) => (
            <option key={subject.id} value={subject.id} className="bg-gray-900">
              {subject.name}
            </option>
          ))}
        </motion.select>

        <motion.div whileHover={{ scale: 1.03 }}>
          <DatePicker
            value={filters.date}
            onChange={(val) => setFilters((prev) => ({ ...prev, date: val }))}
          />
        </motion.div>
      </motion.div>

      {/* Results */}
      {isLoading ? (
        <AttendanceHistoryTableLoadingSkeleton />
      ) : error || !data?.success ? (
        <p className="text-center text-red-400">
          Failed to load attendance history.
        </p>
      ) : (
        <motion.div
          className="rounded-2xl border border-cyan-500/30 bg-gray-900/60 backdrop-blur-md shadow-xl shadow-cyan-500/10 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <table className="w-full text-left">
            <thead className="bg-gray-800/60 text-xs text-cyan-300 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3">Subject</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date & Time</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {data.attendance.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-16 text-gray-500 italic"
                  >
                    No records found for the selected filters.
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {data.attendance.map((rec: any) => (
                    <motion.tr
                      key={rec.id}
                      className="hover:bg-cyan-500/5 transition-colors cursor-pointer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <td className="px-6 py-4 font-medium">
                        {rec.studentName}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {rec.subjectName}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            rec.status === "PRESENT"
                              ? "bg-green-500/20 text-green-300"
                              : rec.status === "ABSENT"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-yellow-500/20 text-yellow-300"
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {new Date(rec.markedAt)
                          .toISOString()
                          .replace("T", " ")
                          .slice(0, 16)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setRecordToEdit(rec)}
                          className="p-1.5 hover:bg-indigo-600 rounded-md"
                        >
                          <Edit size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <motion.div
              className="flex justify-between items-center p-4 bg-gray-800/60 border-t border-cyan-500/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.button
                onClick={() => setPage((p) => p - 1)}
                disabled={data.pagination.currentPage <= 1}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600/80 hover:bg-cyan-600 rounded-xl text-sm font-medium disabled:bg-gray-700 disabled:cursor-not-allowed transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft size={16} /> Previous
              </motion.button>

              <span className="text-sm text-gray-400">
                Page {data.pagination.currentPage} of{" "}
                {data.pagination.totalPages}
              </span>

              <motion.button
                onClick={() => setPage((p) => p + 1)}
                disabled={
                  data.pagination.currentPage >= data.pagination.totalPages
                }
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600/80 hover:bg-cyan-600 rounded-xl text-sm font-medium disabled:bg-gray-700 disabled:cursor-not-allowed transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next <ChevronRight size={16} />
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}
      <button
        onClick={handleExport}
        className="fixed bottom-8 right-8 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-105 transition-transform rounded-2xl text-white font-semibold shadow-lg shadow-cyan-500/30 z-50"
      >
        <Download size={18} /> Download Report
      </button>
      {recordToEdit && (
        <EditAttendanceModal
          isOpen={!!recordToEdit}
          onClose={() => setRecordToEdit(null)}
          onSuccess={() => {
            const key = createApiUrl("/api/teacher/past-attendance");
            if (key) mutate(key); // Re-fetch SWR data for this key
            setRecordToEdit(null);
          }}
          attendanceRecord={recordToEdit}
        />
      )}
    </main>
  );
}
