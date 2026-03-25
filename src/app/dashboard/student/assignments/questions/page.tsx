"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import QuestionContent from "@/components/student/assignments/QuestionContent";

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