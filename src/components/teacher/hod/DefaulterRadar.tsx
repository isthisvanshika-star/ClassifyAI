"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import { AlertTriangle, Send } from "lucide-react";
import { useState } from "react";
import SubjectBar from "./SubjectBar";
import RiskBadge from "./RiskBadge";
import RadarSkeleton from "./RadarSkeleton";
import ErrorState from "./ErrorState";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DefaulterRadar({
  campusId,
  teacherId,
}: {
  campusId: string;
  teacherId: string;
}) {
  const [loadingSend, setLoadingSend] = useState(false);

  const { data, isLoading, error, mutate } = useSWR(
    campusId
      ? `/api/teacher/hod/student-attendance?campusId=${campusId}`
      : null,
    fetcher,
  );

  async function handleNotify() {
    try {
      setLoadingSend(true);

      await fetch("/api/teacher/hod/student-attendance", {
        method: "POST",
        body: JSON.stringify({
          campusId,
          sentBy: teacherId,
        }),
      });

      mutate();
    } finally {
      setLoadingSend(false);
    }
  }

  if (isLoading) return <RadarSkeleton />;
  if (error || !data) return <ErrorState message="Failed to load defaulters" />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Defaulter Radar</h2>

        <button
          onClick={handleNotify}
          disabled={loadingSend}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:scale-105 transition"
        >
          <Send size={16} />
          {loadingSend ? "Sending..." : "Notify All"}
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {data.defaulters.map((student: any) => (
          <motion.div
            key={student.studentId}
            whileHover={{ scale: 1.02 }}
            className="p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10"
          >
            <div className="flex justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {student.name}
                </h3>
                <p className="text-xs text-white/60">
                  Roll: {student.rollNumber}
                </p>
              </div>

              <RiskBadge value={student.lowestPercentage} />
            </div>
            <div className="space-y-2">
              {student.subjects.map((sub: any) => (
                <SubjectBar key={sub.subjectId} sub={sub} />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
