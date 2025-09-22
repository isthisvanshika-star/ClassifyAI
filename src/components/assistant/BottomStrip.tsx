"use client";

import { motion } from "framer-motion";
import { Tektur } from "next/font/google";
import { useEffect, useState } from "react";

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface Student {
  name: string;
  percentage: number;
}

interface Teacher {
  name: string;
  count: number;
}

interface BottomStripData {
  success: boolean;
  topStudents: Student[];
  atRiskStudents: Student[];
  teacherActivity: Teacher[];
}

const BottomStrip = () => {
  const [data, setData] = useState<BottomStripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. First, get the logged-in admin's session to find their campusId
        const campusId = localStorage.getItem("CampusID");
        if (!campusId) {
            throw new Error("Admin is not associated with a campus.");
        }

        // 2. Then, use that campusId to fetch the campus-specific analytics
        // Note: The API endpoint path should match your analytics API
        const analyticsRes = await fetch(`/api/assistant/bottom-strip?campusId=${campusId}`);
        const analyticsJson = await analyticsRes.json();
        
        if (!analyticsJson.success) {
            throw new Error("Failed to load dashboard data.");
        }

        setData(analyticsJson);

      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
        console.error("Failed to fetch bottom strip data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-center text-cyan-300 animate-pulse">Loading Analytics...</p>;
  }

  if (error || !data) {
    return <p className="text-center text-red-400">{error || "Failed to load dashboard data."}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      {/* Top Students */}
      <motion.div
        className="bg-green-900/20 p-4 rounded-2xl border border-green-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className={`text-lg font-bold text-green-300 mb-3 ${tektur.className}`}>
          🌟 Top Attending Students
        </h2>
        {data.topStudents.length === 0 ? (
          <p className="text-center text-sm text-gray-400 pt-4">No attendance data yet.</p>
        ) : (
          data.topStudents.map((student) => (
            <div key={student.name} className="flex justify-between text-green-100 py-1">
              <span>{student.name}</span>
              <span>{student.percentage}%</span>
            </div>
          ))
        )}
      </motion.div>

      {/* At-Risk Students */}
      <motion.div
        className="bg-red-900/20 p-4 rounded-2xl border border-red-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className={`text-lg font-bold text-red-300 mb-3 ${tektur.className}`}>
          🚨 At-Risk Students (&lt;75%)
        </h2>
        {data.atRiskStudents.length === 0 ? (
          <p className="text-center text-sm text-gray-400 pt-4">No students are currently at risk.</p>
        ) : (
          data.atRiskStudents.map((student) => (
            <div key={student.name} className="flex justify-between text-red-100 py-1">
              <span>{student.name}</span>
              <span>{student.percentage}%</span>
            </div>
          ))
        )}
      </motion.div>

      {/* Teacher Activity */}
      <motion.div
        className="bg-cyan-900/20 p-4 rounded-2xl border border-cyan-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className={`text-lg font-bold text-cyan-300 mb-3 ${tektur.className}`}>
          👩‍🏫 Teacher Activity Today
        </h2>
        {data.teacherActivity.length === 0 ? (
          <p className="text-center text-sm text-gray-400 pt-4">No teacher activity today.</p>
        ) : (
          data.teacherActivity.map((teacher) => (
            <div key={teacher.name} className="flex justify-between text-cyan-100 py-1">
              <span>{teacher.name}</span>
              <span>{teacher.count} classes</span>
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default BottomStrip;