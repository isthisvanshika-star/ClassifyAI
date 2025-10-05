"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function TConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative bg-gray-900/70 border border-white/10 rounded-xs shadow-[0_0_25px_rgba(139,92,246,0.3)] backdrop-blur-xl p-8 w-full max-w-md text-white"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient header line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r rounded-2xl from-violet-500 via-blue-500 to-cyan-500 rounded-t-2xl"></div>

          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            {title}
          </h2>

          <p className="text-gray-300 mb-6">{message}</p>

          <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="py-2 px-4 rounded-xl bg-gray-800/60 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="relative py-2 px-5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 hover:opacity-90 hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50"
            >
              {isLoading ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
