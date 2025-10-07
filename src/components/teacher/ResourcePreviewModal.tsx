"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Download } from "lucide-react";

interface ResourcePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource:
    | {
        title: string;
        description?: string;
        previewUrl: string;
      }
    | null;
}

export default function ResourcePreviewModal({
  isOpen,
  onClose,
  resource,
}: ResourcePreviewModalProps) {
  if (!isOpen || !resource) return null;

  const fileUrl = resource.previewUrl || "";
  const lowerUrl = fileUrl.toLowerCase();

  const isPDF = lowerUrl.endsWith(".pdf");
  const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(lowerUrl);
  const isVideo = /\.(mp4|webm|ogg)$/i.test(lowerUrl);
  const isAudio = /\.(mp3|wav|ogg)$/i.test(lowerUrl);
  const isText =
    /\.(txt|csv|json|md)$/i.test(lowerUrl) || lowerUrl.startsWith("data:text");

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="resource-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            key={fileUrl}
            className="relative bg-gradient-to-br from-[#0f172a]/90 to-[#1e293b]/80 border border-white/10 rounded-2xl p-6 w-full max-w-5xl shadow-[0_0_25px_rgba(99,102,241,0.2)] backdrop-blur-xl"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-cyan-500/20 hover:scale-110 transition-all"
              aria-label="Close"
            >
              <X size={20} className="text-gray-200 hover:text-white" />
            </button>

            {/* Header */}
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-semibold bg-gradient-to-br from-cyan-400  to-blue-500 bg-clip-text text-transparent">
                {resource.title}
              </h2>
              {resource.description && (
                <p className="text-gray-400 mt-2 text-sm">
                  {resource.description}
                </p>
              )}
            </div>

            {/* File Preview */}
            <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40 shadow-inner">
              {isPDF ? (
                <iframe
                  src={`${fileUrl}#toolbar=0&navpanes=0`}
                  className="w-full h-[75vh]"
                  title={resource.title}
                />
              ) : isImage ? (
                <img
                  src={fileUrl}
                  alt={resource.title}
                  className="w-full h-[75vh] object-contain"
                  onError={(e) => (e.currentTarget.src = "/no-preview.png")}
                />
              ) : isVideo ? (
                <video
                  src={fileUrl}
                  controls
                  className="w-full h-[75vh] rounded-lg bg-black"
                />
              ) : isAudio ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <audio src={fileUrl} controls className="w-full" />
                </div>
              ) : isText ? (
                <iframe
                  src={fileUrl}
                  className="w-full h-[75vh] bg-[#0f172a] text-white"
                  title={resource.title}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
                  <FileText size={40} className="mb-3 text-cyan-400" />
                  <p>Preview not available for this file type.</p>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="mt-4 bg-cyan-600/80 hover:bg-cyan-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition"
                  >
                    <Download size={16} />
                    Download File
                  </a>
                </div>
              )}
            </div>

            {/* PDF fallback link */}
            {isPDF && (
              <p className="text-center text-gray-400 text-sm mt-3">
                ⚠️ If the PDF doesn’t appear,{" "}
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline"
                >
                  click here to open it in a new tab
                </a>
                .
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
