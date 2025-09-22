"use client";
import React from "react";
import { motion } from "framer-motion";

const StatsCard = ({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color?: string;
}) => {
  return (
<motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className={`flex flex-col gap-1 p-4 rounded-2xl shadow bg-orange-50/5 border ${
        color ?? "border-orange-400"
      }`}
    >
      <span className="text-xs text-orange-100">{title}</span>
      <span className="text-2xl font-semibold text-orange-200">{value}</span>
    </motion.div>
  );
};

export default StatsCard;
