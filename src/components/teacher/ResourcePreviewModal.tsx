"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Download } from "lucide-react";

export default function ResourcePreviewModal({
  isOpen,
  onClose,
  resource,
}: {
  isOpen: boolean;
  onClose: () => void;
  resource: { title: string; fileUrl: string; description?: string };
}) {
  if (!isOpen || !resource) return null;

  const isPDF = resource.fileUrl?.endsWith(".pdf");
  const isImage = /\.(png|jpe?g|gif|webp)$/i.test(resource.fileUrl);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-[#0f172a]/90 border border-white/10 rounded-xl p-6 w-full max-w-5xl shadow-2xl"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              {resource.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <X size={18} />
            </button>
          </div>

          {resource.description && (
            <p className="text-gray-400 mb-4">{resource.description}</p>
          )}

          <div className="border border-white/10 rounded-lg overflow-hidden bg-black/30">
            {isPDF ? (
              <iframe
                src={resource.fileUrl}
                className="w-full h-[70vh] rounded-lg"
              />
            ) : isImage ? (
              <img
                src={resource.fileUrl}
                alt={resource.title}
                className="w-full h-[70vh] object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                <FileText size={40} className="mb-3 text-indigo-400" />
                <p>Preview not available for this file type.</p>
                <a
                  href={resource.fileUrl}
                  download
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition"
                >
                  <Download size={16} />
                  Download File
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
