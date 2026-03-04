"use client";
import { motion } from "framer-motion";
import { BarChart } from "lucide-react";

export default function AssignmentAnalytics({ analytics }: { analytics: any }) {
  const stats = [
    { label: "Submission Rate", value: `${analytics.submissionCount} / ${analytics.totalStudents}`, color: "text-cyan-300" },
    { label: "Highest Grade", value: analytics.highestGrade ?? "N/A", color: "text-green-400" },
    { label: "Lowest Grade", value: analytics.lowestGrade ?? "N/A", color: "text-red-400" },
    { label: "Not Submitted", value: analytics.nonSubmitters.length, color: "text-yellow-400" },
  ];

  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 p-6 rounded-2xl border border-gray-800 bg-white/5 backdrop-blur-lg">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
        <BarChart size={24} /> Analytics
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map((stat) => (
          <div key={stat.label} className="p-5 rounded-xl bg-white/10">
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      {analytics.nonSubmitters.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold text-gray-400">Missing Submissions:</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {analytics.nonSubmitters.map((s: any) => (
              <span key={s.id} className="bg-red-900/40 text-red-300 px-3 py-1 rounded-lg text-xs">{s.name}</span>
            ))}
          </div>
        </div>
      )}
    </motion.section>
  );
}