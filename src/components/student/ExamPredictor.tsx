"use client";

import { useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  FileText,
  Loader2,
  BookOpen,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ExamPredictor({
  subjectId,
  subjectName,
}: {
  subjectId: string;
  subjectName: string;
}) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { data, error, isLoading } = useSWR(
    subjectId ? `/api/student/predict?subjectId=${subjectId}` : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  const predictions = data?.predictions || [];
  console.log("API Trigger:", subjectId);
  console.log("Response:", data);
  console.log("Error:", error);
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-3xl border border-white/5">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">
          Analyzing Past Papers...
        </h3>
        <p className="text-gray-400 text-sm">
          Classify AI is finding patterns in {subjectName} PYQs.
        </p>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 rounded-3xl border border-red-500/20">
        <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-red-300 font-medium text-center">
          {data?.error ||
            "Failed to generate predictions. Tell your teacher to upload more PYQs!"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-violet-500/20 rounded-3xl p-6 md:p-8 shadow-[0_0_30px_rgba(139,92,246,0.1)] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className="p-4 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 rounded-2xl border border-white/5">
          <Sparkles className="w-8 h-8 text-violet-400" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            AI Exam Predictor
          </h2>
          <p className="text-sm text-cyan-400 font-semibold flex items-center gap-2 mt-1">
            <TrendingUp size={16} /> Based on {data.totalPapersAnalyzed} past
            papers of {subjectName}
          </p>
        </div>
      </div>

      {/* Predictions List */}
      <div className="space-y-4 relative z-10">
        {predictions.map((item: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-black/40 border border-white/5 hover:border-violet-500/30 rounded-2xl p-5 transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Topic Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                    ${
                      item.weightage === "High"
                        ? "bg-red-500/20 text-red-400 border border-red-500/20"
                        : item.weightage === "Medium"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/20"
                          : "bg-green-500/20 text-green-400 border border-green-500/20"
                    }`}
                  >
                    {item.weightage} Weightage
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-violet-300 transition-colors">
                  {item.topic}
                </h3>
                <p className="text-sm text-gray-400">{item.reason}</p>
              </div>

              {/* Probability Circle & Action Button */}
              <div className="flex items-center gap-6 md:justify-end">
                {/* Custom Progress Circle */}
                <div className="relative flex items-center justify-center w-16 h-16">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      className="text-white/5"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={28 * 2 * Math.PI}
                      strokeDashoffset={
                        28 * 2 * Math.PI -
                        (item.probability / 100) * (28 * 2 * Math.PI)
                      }
                      className="text-cyan-400 transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-sm font-bold text-white">
                      {item.probability}%
                    </span>
                  </div>
                </div>

                {/* The Magic "Auto-Solution" Button */}
                <button
                  onClick={() => setSelectedTopic(item.topic)}
                  className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-violet-500/20 text-gray-300 hover:text-violet-300 rounded-xl border border-white/10 hover:border-violet-500/50 transition-all font-semibold text-sm"
                >
                  <FileText size={16} /> Get Answer
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Auto-Solution Mockup Modal (Next Step) */}
      <AnimatePresence>
        {selectedTopic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedTopic(null)}
          >
            <div
              className="bg-slate-900 border border-violet-500/30 rounded-3xl p-8 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center py-10">
                <BookOpen className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  Generating Answer...
                </h3>
                <p className="text-gray-400">
                  Classify AI is scanning uploaded notes for "{selectedTopic}".
                </p>
                <p className="text-xs text-violet-400 mt-4">
                  (Auto-solution feature coming next!)
                </p>

                <button
                  onClick={() => setSelectedTopic(null)}
                  className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
