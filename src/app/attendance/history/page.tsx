"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AttendanceRecord {
  id: string;
  studentId: string;
  subject: string;
  status: string;
  date: string;
}

const AttendanceHistoryPage = () => {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [limit] = useState(10);
  const router = useRouter();
  const studentId =
    typeof window !== "undefined" ? localStorage.getItem("studentId") : null;

  const campusId = typeof window !== "undefined" ? localStorage.getItem("CampusID") : null;

  useEffect(() => {
    if (!studentId || !campusId) {
      setError("Student ID not found in localStorage.");
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `/api/attendance/history?studentId=${studentId}&campusId=${campusId}&page=${page}&limit=${limit}`
        );
        const data = await res.json();
        if (data.success) {
          setHistory(data.history);
        } else {
          setError(data.error || "Failed to fetch data.");
        }
      } catch (err) {
        setError("Error fetching attendance history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [studentId, page, limit]);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-5xl text-center mb-20 font-bold text-cyan-300">
        Attendance History
      </h1>

      {loading && (
        <p className="text-gray-200 text-center animate-pulse">Loading attendance records...</p>
      )}

      {error && <p className="text-red-400">{error}</p>}

      {!loading && history.length === 0 && (
        <p className="text-gray-400 text-center">No attendance records found.</p>
      )}
      <div className="mb-6 relative bg-white/10  rounded-4xl  ">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 rounded-4xl bg-transparent text-cyan-200 transition-all duration-200 placeholder:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
      </div>
      <ul className="space-y-4 overflow-y-auto max-h-[60vh]">
        {history
          .filter((record) =>
            record.subject.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((record) => (
            <li
              key={record.id}
              className={`p-4 rounded-xl border ${
                record.status.toUpperCase() === "PRESENT"
                  ? "bg-green-500/10 border-green-300/30 text-green-200"
                  : record.status === "ABSENT"
                  ? "bg-red-500/10 border-red-300/30 text-red-200"
                  : "bg-yellow-500/10 border-yellow-300/30 text-yellow-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{record.subject}</h2>
                  <p className="text-xs opacity-80">
                    {new Date(record.date).toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="text-sm font-bold uppercase tracking-widest">
                  {record.status}
                </span>
              </div>
            </li>
          ))}
      </ul>

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-4 text-cyan-300">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className="w-9 h-9 grid place-items-center rounded-full border border-cyan-500 hover:bg-cyan-500/10"
        >
          <ChevronLeft />
        </button>
        <span className="py-1 px-3 font-medium border border-cyan-500 rounded-lg">
          {page}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="w-9 h-9 grid place-items-center rounded-full border border-cyan-500 hover:bg-cyan-500/10"
        >
          <ChevronRight />
        </button>
      </div>
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => router.push("/dashboard/student")}
          className="flex items-center justify-center gap-2 rounded-full  text-white hover:text-cyan-300 transition-colors"
        >
          <ChevronLeft size={40} />
        </button>
      </div>
    </div>
  );
};

export default AttendanceHistoryPage;
