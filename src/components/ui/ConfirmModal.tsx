"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Tektur } from "next/font/google";

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[9999]"
        >
          <motion.div
            key="modal"
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 w-[90%] max-w-sm space-y-4 text-white shadow-2xl"
          >
            <h2 className={`text-lg font-semibold ${tektur.className}`}>
              Confirm Deletion
            </h2>

            <p className="text-sm text-gray-400">
              {message ?? "Are you sure you want to delete this announcement?"}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              {/* Cancel */}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition"
              >
                Cancel
              </button>

              {/* Delete */}
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-400 transition active:scale-95"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;