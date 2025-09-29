"use client";
import { motion } from "framer-motion";

export default function DashboardLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br ">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative flex flex-col items-center justify-center p-10 rounded-3xl 
                   backdrop-blur-xl bg-white/10 border border-cyan-400/30 shadow-2xl"
      >
        {/* Animated Gradient Circle */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="w-20 h-20 rounded-full border-t-4 border-b-4 border-cyan-400"
        />

        {/* Glow Pulse */}
        <motion.div
          initial={{ opacity: 0.6, scale: 0.9 }}
          animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.1, 0.9] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute w-28 h-28 rounded-full bg-cyan-500/20 blur-2xl"
        />

        {/* Loading Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-6 text-cyan-300 font-semibold text-lg tracking-wide"
        >
          Loading dashboard...
        </motion.p>
      </motion.div>
    </div>
  );
}
