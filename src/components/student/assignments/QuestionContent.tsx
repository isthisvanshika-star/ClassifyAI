"use client";

import SubmitAssignmentModal from "@/components/student/SubmitAssignmentModal";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import AssignmentHeader from "./AssignmentHeader";
import AssignmentQuestions from "./AssignmentQuestions";
import AssignmentRubric from "./AssignmentRubric";
import AssignmentSubmission from "./AssignmentSubmission";
import SubmitButton from "./SubmitButton";
import CenterMessage from "./CenterMessage";
import LoadingState from "./LoadingState";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const QuestionContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assignmentId = searchParams.get("assignmentId");

  const [mounted, setMounted] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);
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
  const submissionData = data?.submissionData;

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen p-6 md:p-10 text-white overflow-hidden bg-transparent">
      {/* BACK BUTTON */}
      <button
        onClick={() => router.push("/dashboard/student/assignments")}
        className="absolute top-6 left-6 flex items-center justify-center rounded-full p-3 bg-white/5 border border-white/10 backdrop-blur-lg hover:bg-cyan-500/20 hover:border-cyan-400 transition-all duration-300"
      >
        <ChevronLeft size={26} />
      </button>

      {!assignmentId ? (
        <CenterMessage text="No Assignment Found" />
      ) : isLoading ? (
        <LoadingState />
      ) : error || !assignment ? (
        <CenterMessage text="Failed to load assignment data. Please try again later." />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-screen  flex items-center justify-center mt-12 space-y-8"
        >
          <div className="flex max-h-full  gap-10">
            <div className="gap-5 flex flex-col">
              <AssignmentHeader assignment={assignment} />
              <div className="flex w-full gap-5">
                <AssignmentQuestions assignment={assignment} />
                <AssignmentRubric rubric={assignment.rubric} />
              </div>

              <SubmitButton
                hasSubmitted={hasSubmitted}
                onClick={() => setShowSubmitForm(true)}
              />
            </div>
            <AssignmentSubmission
              hasSubmitted={hasSubmitted}
              submissionData={submissionData}
              assignment={assignment}
            />
          </div>
        </motion.div>
      )}

      <SubmitAssignmentModal
        isOpen={showSubmitForm}
        onClose={() => setShowSubmitForm(false)}
        onSuccess={() => setShowSubmitForm(false)}
        studentId={studentId}
        assignment={assignment}
      />
    </div>
  );
};

export default QuestionContent;
