import { openInBrowser } from "@/lib/helper";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  X,
} from "lucide-react";
import { useState } from "react";

const AssignmentSubmission = ({
  hasSubmitted,
  submissionData,
  assignment,
}: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!hasSubmitted || !submissionData) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 bg-emerald-900/10 border w-[35rem] border-emerald-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500" />

        <div className="flex flex-col justify-between gap-3 items-center mb-6">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle2 size={28} />
            <h2 className="text-2xl font-bold">Your Submission</h2>
          </div>

          <div className="flex text-xs items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
            {submissionData.grade ? (
              <span className="text-green-400 flex items-center gap-2">
                <Award size={16} />
                {submissionData.grade} / {assignment.totalMarks}
              </span>
            ) : (
              <span className="text-yellow-400 flex items-center gap-2 animate-pulse">
                <Clock size={16} />
                Waiting for grading
              </span>
            )}
          </div>
        </div>

        {submissionData.text && (
          <div>
            <h3 className="text-cyan-400 mb-2 flex gap-2">
              <FileText size={18} /> Written Answer
            </h3>
            <div className="bg-slate-800 p-4 rounded-xl">
              {submissionData.text}
            </div>
          </div>
        )}

        {submissionData.fileUrl && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="group relative flex mx-auto items-center justify-center gap-3 mt-4 w-full md:w-auto px-6 py-4 rounded-2xl 
  bg-white/5 backdrop-blur-xl border border-white/10 
  hover:border-cyan-400/40 transition-all duration-300 
  shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]"
          >
            {/* subtle glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition duration-300" />
            <Eye
              className="text-cyan-400 group-hover:scale-110 transition-transform duration-300 z-10"
              size={20}
            />

            <span className="text-cyan-300 font-medium tracking-wide z-10">
              View Uploaded Document
            </span>
          </button>
        )}
      </motion.div>
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-10 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0  bg-black/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                className="relative w-full max-w-5xl h-[85vh] mx-auto my-auto mt-18 bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.2)] flex flex-col overflow-hidden z-10"
              >
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl z-20">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <FileText size={20} />
                    <h3 className="font-semibold text-lg">
                      Submitted Document
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => openInBrowser(e, submissionData.fileUrl)}
                      className="text-gray-400 hover:text-cyan-400 transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-full"
                      title="Open in System Browser"
                    >
                      <ExternalLink size={18} />
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-400 hover:text-red-400 bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 w-full h-full bg-slate-800/50 p-2 sm:p-4">
                  <iframe
                    src={submissionData.fileUrl}
                    className="w-full h-full rounded-xl border border-white/10 bg-white"
                    title="Submitted Document"
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AssignmentSubmission;
