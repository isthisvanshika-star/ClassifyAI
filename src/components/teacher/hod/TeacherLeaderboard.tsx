"use client";

import useSWR from "swr";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useState } from "react";
import StatusBadge from "./StatusBadge";
import LeaderboardSkeleton from "./LeaderboardSkeleton";
import ErrorState from "./ErrorState";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TeacherLeaderboard({
  campusId,
  teacherId,
}: {
  campusId: string;
  teacherId: string;
}) {
  const [sending, setSending] = useState(false);

  const { data, isLoading, error, mutate } = useSWR(
    campusId ? `/api/teacher/hod/teacher-leaderboard?campusId=${campusId}` : null,
    fetcher,
  );

  async function handleNotify() {
    try {
      setSending(true);

      await fetch("/api/hod/teacher-accountability", {
        method: "POST",
        body: JSON.stringify({
          campusId,
          sentBy: teacherId,
        }),
      });

      mutate();
    } finally {
      setSending(false);
    }
  }

  if (isLoading) return <LeaderboardSkeleton />;
  if (error || !data)
    return <ErrorState message="Failed to load leaderboard" />;

  const chartData = data.leaderboard.map((t: any) => ({
    name: t.name,
    resources: t.totalResources,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">
          🏆 Teacher Leaderboard
        </h2>

        <button
          onClick={handleNotify}
          disabled={sending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg hover:scale-105 transition"
        >
          <Send size={16} />
          {sending ? "Sending..." : "Remind Pending"}
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fill: "#aaa", fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="resources" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {data.leaderboard.map((t: any, index: number) => (
          <motion.div
            key={t.teacherId}
            whileHover={{ scale: 1.02 }}
            className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-white/70">
                #{index + 1}
              </span>

              <div>
                <p className="text-white font-medium">{t.name}</p>
                <p className="text-xs text-white/50">
                  {t.subjectsWithResources}/{t.assignedSubjects} subjects
                  covered
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-white font-semibold">
                {t.totalResources} 📚
              </span>

              <StatusBadge status={t.status} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
