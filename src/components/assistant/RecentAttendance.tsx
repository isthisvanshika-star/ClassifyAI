"use client";

import React, { useEffect, useState } from "react";
import { RecentAttendance } from "@/lib/types";
import { motion } from "framer-motion";

const RecentAttendancePage = ({ expanded }: { expanded: boolean }) => {
  const [recent, setRecent] = useState<RecentAttendance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const campusID = localStorage.getItem("CampusID");
        const res = await fetch(`/api/assistant/recent-attendance?campusId=${campusID}`);
        const data = await res.json();
        if (data.success) {
          console.log({data})
          setRecent(data.recent);
        }
      } catch (error) {
        console.error("Failed to fetch recent attendance:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <p className="text-gray-400 text-sm animate-pulse text-center">
          Loading recent activity…
        </p>
      </div>
    );
  }

  if (recent.length === 0) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <p className="text-gray-400 text-sm text-center">
          No attendance marked today.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      layout
      transition={{ duration: 0.5 }}
      className="overflow-y-auto outline-none w-full scrollbar-hide px-2 sm:px-4"
      style={{
        maxHeight: expanded ? "30rem" : "12rem",
      }}
    >
      <ul className="space-y-3 outline-none">
        {recent.map((rec) => (
          <li
            key={rec.id}
            className="flex justify-between items-center gap-4 p-3 hover:cursor-pointer hover:shadow transition-all duration-700 hover:shadow-amber-600 rounded bg-white/5 text-gray-200"
          >
            <article className="flex flex-1 flex-col min-w-0">
              <span
                className="uppercase text-orange-100 truncate text-sm lg:text-base"
                title={rec.studentName}
              >
                {rec.studentName}
              </span>
              <span className="text-xs text-gray-400">{rec.subjectName}</span>
            </article>
            <span className="uppercase flex-shrink-0 text-sm">
              {rec.status.toUpperCase() === "PRESENT" ? (
                <span className="text-orange-500 font-semibold">present</span>
              ) : (
                <span className="text-red-500">absent</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default RecentAttendancePage;
