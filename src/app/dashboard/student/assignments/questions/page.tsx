"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

const QuestionContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assignmentId = searchParams.get("assignmentId");
  return (
    <div className="p-8 text-white bg-transparent min-h-screen">
      {assignmentId ? (
        <>
          <h1 className="text-4xl font-bold text-cyan-500 mb-4 text-center">
            Question Page
          </h1>
          <div className="p-4 bg-slate-800 rounded-lg border border-cyan-500/30">
            <p>
              Currently viewing Assignment:
              <span className="text-cyan-400 font-mono">{assignmentId}</span>
            </p>
          </div>
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={() => router.push("/dashboard/student")}
              className="flex items-center justify-center gap-2 rounded-full  text-white hover:text-cyan-300 transition-colors"
            >
              <ChevronLeft size={40} />
            </button>
          </div>
        </>
      ) : (
        <p className="text-red-400">No assignmentId found in URL.</p>
      )}
    </div>
  );
};

const QuestionPage = () => {
  return (
    <Suspense
      fallback={<div className="p-8 text-white">Loading assignment...</div>}
    >
      <QuestionContent />
    </Suspense>
  );
};

export default QuestionPage;
