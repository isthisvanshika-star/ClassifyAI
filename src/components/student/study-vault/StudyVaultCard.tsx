"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function StudyVaultCard({ res, getIcon, onClick }: any) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200 }}
      onClick={() => onClick(res)}
      className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-xl cursor-pointer overflow-hidden hover:border-cyan-400/40 transition"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 blur-xl transition" />

      {res.aiSummary?.length > 0 && (
        <div className="absolute top-3 right-3 text-violet-400">
          <Sparkles size={16} className="animate-pulse" />
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition">
          {getIcon(res.resourceType)}
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase">
            {res.resourceType}
          </p>
          <p className="text-xs text-cyan-400 truncate max-w-[140px]">
            {res.subject?.name}
          </p>
        </div>
      </div>

      <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 group-hover:text-cyan-300 transition">
        {res.title}
      </h3>

      <p className="text-sm text-gray-400 line-clamp-2">
        {res.description || "Click to preview"}
      </p>
    </motion.div>
  );
}