import { motion } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  UploadCloud,
} from "lucide-react";

const AssignmentSubmission = ({
  hasSubmitted,
  submissionData,
  assignment,
}: any) => {
  if (!hasSubmitted || !submissionData) return null;

  return (
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
        <a
          href={submissionData.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center gap-3 mt-4 w-full md:w-auto px-6 py-4 rounded-2xl 
  bg-white/5 backdrop-blur-xl border border-white/10 
  hover:border-cyan-400/40 transition-all duration-300 
  shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]"
        >
          {/* subtle glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition duration-300" />

          <ExternalLink
            className="text-cyan-400 group-hover:scale-110 transition-transform duration-300"
            size={20}
          />

          <span className="text-cyan-300 font-medium tracking-wide">
            View Uploaded Document
          </span>
        </a>
      )}
    </motion.div>
  );
};

export default AssignmentSubmission;
