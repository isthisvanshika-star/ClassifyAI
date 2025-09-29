"use client";

import {
  showErrorMessage,
  showLoadingMessage,
  showSuccessMessage,
} from "@/lib/helper";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AttendanceFinalizer({
  token,
  onClose,
}: {
  token: string;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFinalize = async () => {
    setIsLoading(true);
    showLoadingMessage("Finalizing attendance...");
    try {
      const response = await fetch("/api/attendance/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      showSuccessMessage(data.message);
      setTimeout(onClose, 2000);
    } catch (err: any) {
      showErrorMessage(err.message || "An error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative from-gray-950 via-gray-800 to-gray-950 bg-gradient-to-br border border-cyan-500/30 rounded-2xl shadow-2xl w-full max-w-md p-6 text-center text-white"
          initial={{ opacity: 0, scale: 0.85, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 50 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >

          <h2 className="text-3xl font-bold mb-3 text-cyan-400">
            Finalize Session
          </h2>
          <p className="text-gray-300 mb-6">
            The attendance window has closed. Mark all remaining
            students as <span className="text-red-400 font-semibold">absent</span>.
          </p>

          <motion.p
            className="text-3xl font-bold my-6"
          >
            Time’s Up!
          </motion.p>

          <div className="space-y-3">
            <button
              onClick={handleFinalize}
              disabled={isLoading}
              className="w-full py-3 px-4 cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition disabled:bg-gray-600"
            >
              {isLoading ? "Processing..." : "Yes, Mark Absentees"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
