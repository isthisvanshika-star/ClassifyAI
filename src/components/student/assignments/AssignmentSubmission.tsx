import { openInBrowser } from "@/lib/helper";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  MessageSquare,
  Mic,
  X,
} from "lucide-react";
import { useState } from "react";

const AssignmentSubmission = ({
  hasSubmitted,
  submissionData,
  assignment,
}: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);

  if (!hasSubmitted || !submissionData) return null;

  console.log("Submission Data:", submissionData);

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
          <div className="h-[47rem] overflow-hidden">
            <h3 className="text-cyan-400 mb-2 flex gap-2">
              <FileText size={18} /> Written Answer
            </h3>

            <div className="bg-slate-800 overflow-hidden h-[45rem] p-4 rounded-xl relative">
              <p className="line-clamp-[29]">{submissionData.text}</p>
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-800 to-transparent pointer-events-none" />
              <button
                onClick={() => setIsTextModalOpen(true)}
                className="absolute bottom-4 right-4 text-sm px-4 py-2 rounded-full 
        bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 
        hover:bg-cyan-400/20 transition-all"
              >
                Read Full Answer
              </button>
            </div>
          </div>
        )}

        {submissionData.fileUrl && (
          <div className="w-full max-w-xl mx-auto mt-6">
            <div
              className="relative rounded-2xl p-5 
      bg-white/5 backdrop-blur-xl border border-white/10
      shadow-[0_0_25px_rgba(6,182,212,0.08)] 
      hover:shadow-[0_0_30px_rgba(6,182,212,0.18)]
      transition-all duration-300"
            >
              {/* glow layer */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10 opacity-0 hover:opacity-100 transition duration-300" />

              {/* Top Section */}
              <div className="flex items-center justify-between z-10 relative">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10">
                    <Eye className="text-cyan-400" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Submission File</p>
                    <p className="text-cyan-300 font-semibold">
                      Uploaded Document
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-sm font-medium
          bg-gradient-to-r from-cyan-500 to-blue-500 
          hover:from-cyan-400 hover:to-blue-400
          text-white transition-all duration-300 shadow-md"
                >
                  View
                </button>
              </div>
{submissionData.grade !== null &&
  submissionData.grade !== undefined && (
    <div className="mt-6 pt-6 border-t border-white/10">
      <div className="flex items-center justify-between mb-5">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-cyan-400">
          <Award size={18} />
          Teacher Evaluation
        </h3>
        <div className="px-3 py-1 rounded-full text-xs font-semibold 
          bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-blue-500/20 
          border border-cyan-400/30 text-cyan-300 shadow-sm backdrop-blur-md">
          Grade: {submissionData.grade}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {submissionData.feedback ? (
          <div className="relative group 
            bg-white/5 backdrop-blur-xl 
            border border-white/10 
            p-5 rounded-2xl 
            transition-all duration-300
            hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-500/10">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 blur-xl bg-cyan-500/10"></div>

            <div className="flex items-center gap-2 text-cyan-300 mb-3 text-sm font-semibold">
              <MessageSquare size={16} />
              Remarks by{" "}
              <span className="text-white">
                {submissionData.gradedBy || "Teacher"}
              </span>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed italic relative z-10">
              “{submissionData.feedback}”
            </p>
          </div>
        ) : (
          <div className="text-center py-6 rounded-xl 
            bg-white/5 border border-white/10 text-gray-500 text-sm italic">
            No written feedback provided.
          </div>
        )}
        {submissionData.audioFeedbackUrl && (
          <div className="relative group 
            bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-blue-500/10 
            border border-cyan-400/20 
            backdrop-blur-xl 
            p-5 rounded-2xl 
            transition-all duration-300
            hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/20">
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 blur-xl bg-purple-500/10"></div>

            <div className="flex items-center gap-2 text-purple-300 mb-3 text-sm font-semibold">
              <Mic size={16} className="animate-pulse" />
              Voice Feedback
            </div>

            <audio
              src={submissionData.audioFeedbackUrl}
              controls
              className="w-full h-10 rounded-lg outline-none opacity-90
              [&::-webkit-media-controls-panel]:bg-[#020617]
              [&::-webkit-media-controls-play-button]:text-white
              [&::-webkit-media-controls-current-time-display]:text-white
              [&::-webkit-media-controls-time-remaining-display]:text-gray-400"
            />
            <p className="text-[10px] text-gray-500 mt-2 tracking-wide">
              Tap to listen • Recorded by {submissionData.gradedBy || "Teacher"}
            </p>
          </div>
        )}
      </div>
    </div>
)}
            </div>
          </div>
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
                    src={
                      submissionData.fileUrl.endsWith(".pdf")
                        ? submissionData.fileUrl
                        : `https://docs.google.com/gview?url=${submissionData.fileUrl}&embedded=true`
                    }
                    className="w-full h-full rounded-xl border border-white/10 bg-white"
                    title="Submitted Document"
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isTextModalOpen && (
          <div className="fixed inset-0 z-20 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTextModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="relative w-full max-w-4xl h-[85vh] bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.2)] flex flex-col overflow-hidden z-30"
            >
              <div className="flex justify-between items-center p-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-cyan-400">
                  <FileText size={20} />
                  <h3 className="font-semibold text-lg">Full Answer</h3>
                </div>

                <button
                  onClick={() => setIsTextModalOpen(false)}
                  className="text-gray-400 hover:text-red-400 bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 text-gray-200 leading-relaxed">
                {submissionData.text}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AssignmentSubmission;
