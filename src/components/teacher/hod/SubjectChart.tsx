"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

import React from "react";

const SubjectChart = ({ subject }: { subject: any }) => {
  const avg =
    subject.trend.reduce((acc: number, d: any) => acc + d.percentage, 0) /
    subject.trend.length;

  const trendDirection =
    subject.trend[subject.trend.length - 1].percentage -
    subject.trend[0].percentage;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="p-4 rounded-xl bg-white/5 border border-white/10"
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-medium">{subject.subjectName}</h3>

        <div className="text-sm text-white/60">Avg: {Math.round(avg)}%</div>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={subject.trend}>
            <XAxis dataKey="date" tick={{ fill: "#aaa", fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#aaa", fontSize: 10 }} />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="percentage"
              stroke={avg < 50 ? "#ef4444" : avg < 75 ? "#facc15" : "#4ade80"}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between mt-2 text-xs">
        <span
          className={`${
            avg < 50
              ? "text-red-400"
              : avg < 75
                ? "text-yellow-400"
                : "text-green-400"
          }`}
        >
          {avg < 50
            ? "Critical Attendance"
            : avg < 75
              ? "Needs Attention"
              : "Healthy"}
        </span>

        <span
          className={`${
            trendDirection < 0 ? "text-red-400" : "text-green-400"
          }`}
        >
          {trendDirection < 0 ? "↓ Dropping" : "↑ Improving"}
        </span>
      </div>
    </motion.div>
  );
};

export default SubjectChart;
