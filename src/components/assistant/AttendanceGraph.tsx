"use client";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Tektur } from "next/font/google";

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dummyData = [
  { date: "Mon", attendance: 75 },
  { date: "Tue", attendance: 80 },
  { date: "Wed", attendance: 78 },
  { date: "Thu", attendance: 82 },
  { date: "Fri", attendance: 79 },
  { date: "Sat", attendance: 85 },
];

const AttendanceGraph = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-[300px]"
    >
      <h3
        className={`text-lg font-semibold text-orange-700 ${tektur.className} mb-4 `}
      >
        Weekly Attendance
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dummyData}>
          <CartesianGrid stroke="#444" />
          <XAxis dataKey="date" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "none",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#38bdf8" }}
            itemStyle={{ color: "#facc15" }}
          />
          <Line
            type="monotone"
            dataKey="attendance"
            stroke="#b30000"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default AttendanceGraph;
