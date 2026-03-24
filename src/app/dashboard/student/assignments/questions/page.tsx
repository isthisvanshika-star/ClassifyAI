"use client";

import SubmitAssignmentModal from "@/components/student/SubmitAssignmentModal";
import { questionCleaner } from "@/lib/helper";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ClipboardCheck,
  Loader2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const QuestionContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assignmentId = searchParams.get("assignmentId");
  const [mounted, setMounted] = useState<boolean>(false);
  const [studentId, setStudentId] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("studentId") : null,
  );

  const [showSubmitForm, setShowSubmitForm] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStudentId(localStorage.getItem("studentId"));
  }, []);

  const { data, error, isLoading } = useSWR(
    assignmentId && studentId
      ? `/api/student/assignments/detail?assignmentId=${assignmentId}&studentId=${studentId}`
      : null,
    fetcher,
  );

  const assignment = data?.assignment;
  const hasSubmitted = data?.hasSubmitted;

  if (!mounted) return;

  return (
    <div className="relative min-h-screen p-6 md:p-10 text-white overflow-hidden bg-transparent">
      <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-cyan-500/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-purple-500/20 blur-[120px] rounded-full" />
      <button
        onClick={() => router.push("/dashboard/student/assignments")}
        className="absolute top-6 left-6 flex items-center justify-center rounded-full p-3 bg-white/5 border border-white/10 backdrop-blur-lg hover:bg-cyan-500/20 hover:border-cyan-400 transition-all duration-300"
      >
        <ChevronLeft size={26} />
      </button>

      {!assignmentId ? (
        <div className="flex justify-center items-center h-[80vh]">
          <p className="text-red-400 bg-red-500/10 px-6 py-3 rounded-xl border border-red-500/30">
            No Assignment Found
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col justify-center items-center h-[80vh] gap-3">
          <Loader2 size={40} className="text-cyan-400 animate-spin" />
          <p className="text-cyan-300 animate-pulse">Loading Assignment...</p>
        </div>
      ) : error || !assignment ? (
        <div className="flex justify-center items-center h-[80vh]">
          <p className="text-red-400 bg-red-500/10 px-6 py-3 rounded-xl border border-red-500/30">
            Failed to load assignment data. Please try again later.
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto mt-12 space-y-8"
        >
          <div className="relative p-[1px] rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500">
            <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl p-8">
              <div className="flex items-center gap-2 text-cyan-400 mb-3">
                <BookOpen size={18} />
                <span className="uppercase text-sm tracking-wider">
                  {assignment.subject?.name || "Subject"}
                </span>
              </div>

              <h1 className="text-4xl h-[4rem] md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {assignment.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  <CalendarDays size={16} className="text-cyan-400" />
                  <span
                    className={
                      new Date(assignment.dueDate) < new Date()
                        ? "text-red-400"
                        : "text-gray-300"
                    }
                  >
                    {assignment.dueDate
                      ? new Date(assignment.dueDate).toLocaleString()
                      : "No Due Date"}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                  <Award size={16} className="text-yellow-400" />
                  <span>
                    {assignment.totalMarks
                      ? `${assignment.totalMarks} Marks`
                      : "Not Graded"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-full gap-5">
            <div className="p-[1px] rounded-3xl bg-gradient-to-r from-cyan-500/40 w-3/4 to-blue-500/40">
              <div className="bg-[#020617]/80 backdrop-blur-xl rounded-3xl p-8">
                <h2 className="text-xl font-semibold text-cyan-300 mb-6 border-b border-white/10 pb-3">
                  Assignment Questions
                </h2>

                {(() => {
                  if (!assignment.description) {
                    return (
                      <p className="text-gray-400 italic">
                        No description available.
                      </p>
                    );
                  }

                  try {
                    const parsedData = JSON.parse(assignment.description);
                    if (Array.isArray(parsedData)) {
                      return (
                        <ul className="space-y-5 whitespace-pre-wrap">
                          {parsedData.map((q: string, index: number) => (
                            <motion.li
                              key={index}
                              whileHover={{ scale: 1.02 }}
                              className="p-5 whitespace-pre-wrap rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all"
                            >
                              <span className="text-cyan-400 font-semibold whitespace-pre-wrap">
                                Q{index + 1}.
                              </span>{" "}
                              {questionCleaner(q)}
                            </motion.li>
                          ))}
                        </ul>
                      );
                    }
                  } catch {
                    return (
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {assignment.description}
                      </p>
                    );
                  }
                })()}
              </div>
            </div>
            {assignment.rubric && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-[#0f172a]/70 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden"
              >
                {/* 🌫️ Soft Glow (very subtle) */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full pointer-events-none" />

                {/* 🧾 Header */}
                <div className="flex items-center gap-3 text-indigo-300 mb-5 border-b border-white/10 pb-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-400/20">
                    <ClipboardCheck size={18} />
                  </div>
                  <h2 className="text-lg font-semibold tracking-wide">
                    Grading Rubric
                  </h2>
                </div>

                {/* 📄 Content */}
                <div className="text-gray-300 space-y-3">
                  {Array.isArray(assignment.rubric) ? (
                    <ul className="space-y-2">
                      {assignment.rubric.map((item: string, index: number) => (
                        <li
                          key={index}
                          className="flex gap-3 items-start px-3 py-2 rounded-lg bg-white/5 border border-white/5 hover:border-indigo-400/20 transition"
                        >
                          <span className="text-indigo-400 text-sm font-medium">
                            {index + 1}.
                          </span>
                          <span className="text-sm leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm leading-relaxed bg-white/5 border border-white/5 rounded-lg p-3">
                      {assignment.rubric}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
          <div className="mt-8 flex justify-end">
            {hasSubmitted ? (
              <button
                disabled
                className="bg-slate-800 text-green-400 border border-green-500/30 font-semibold py-3 px-8 rounded-full cursor-not-allowed flex items-center gap-2"
              >
                <ClipboardCheck size={20} />
                Already Submitted
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitForm(true)}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105"
              >
                Prepare Submission
              </button>
            )}
          </div>
        </motion.div>
      )}
      <SubmitAssignmentModal
        isOpen={showSubmitForm}
        onClose={() => setShowSubmitForm(false)}
        onSuccess={() => {
          setShowSubmitForm(false);
          // future me revalidate kar sakte ho (SWR mutate)
        }}
        studentId={studentId}
        assignment={assignment}
      />
    </div>
  );
};

const QuestionPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 size={40} className="animate-spin text-cyan-400" />
        </div>
      }
    >
      <QuestionContent />
    </Suspense>
  );
};

export default QuestionPage;
