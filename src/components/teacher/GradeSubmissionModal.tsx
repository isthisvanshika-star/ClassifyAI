"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  openInBrowser,
  showErrorMessage,
  showLoadingMessage,
  showSuccessMessage,
  toastDissmisser,
} from "@/lib/helper";
import GradeModalHeader from "./submissions/modal/GradeModalHeader";
import SubmissionPreview from "./submissions/modal/SubmissionPreview";
import AIAssistantSection from "./submissions/modal/AIAssistantSection";
import GradeSection from "./submissions/modal/GradeSection";
import FeedbackSection from "./submissions/modal/FeedbackSection";
import ModalFooter from "./submissions/modal/ModalFooter";

export default function GradeSubmissionModal({
  isOpen,
  onClose,
  onSuccess,
  submission,
  allSubmissions,
  onNavigate,
  totalMarks,
  dueDate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  submission: any;
  allSubmissions: any[];
  onNavigate: (sub: any) => void;
  totalMarks: number | null;
  dueDate: string | null;
}) {
  const [grade, setGrade] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [gradeMode, setGradeMode] = useState<"manual" | "rubric">("manual");
  const [feedbackMode, setFeedbackMode] = useState<"text" | "audio">("text");
  const [rubric, setRubric] = useState({
    concept: 0,
    execution: 0,
    formatting: 0,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    summary: string[];
    aiProbability: number;
  } | null>(null);
  const [attachSignature, setAttachSignature] = useState(false);
  const currentIndex =
    allSubmissions?.findIndex((s) => s.id === submission?.id) ?? -1;
  const hasNext =
    currentIndex !== -1 && currentIndex < (allSubmissions?.length || 0) - 1;

  const isLate =
    dueDate && new Date(submission?.submittedAt) > new Date(dueDate);

  useEffect(() => {
    if (isOpen && submission) {
      setTeacherId(localStorage.getItem("teacherId"));
      setGrade(submission?.grade?.toString() || "");
      setFeedback(submission?.feedback || "");
      setGradeMode("manual");
      setFeedbackMode("text");
      setRubric({ concept: 0, execution: 0, formatting: 0 });
      setAttachSignature(true);
      if (
        submission.aiSummary?.length > 0 &&
        submission.aiProbability !== null
      ) {
        setAnalysisResult({
          summary: submission.aiSummary,
          aiProbability: submission.aiProbability,
        });
      } else {
        setAnalysisResult(null);
      }
    }
  }, [isOpen, submission]);

  useEffect(() => {
    if (gradeMode === "rubric") {
      const total =
        (rubric.concept || 0) +
        (rubric.execution || 0) +
        (rubric.formatting || 0);
      setGrade(total.toString());
    }
  }, [rubric, gradeMode]);

  const runAIAnalysis = async () => {
    if (!teacherId || !submission.id) {
      return;
    }
    setIsAnalyzing(true);
    const toastId = showLoadingMessage("AI is analyzing the document....");
    try {
      const response = await fetch("/api/teacher/submissions/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: submission.id,
          teacherId: teacherId,
        }),
      });
      const data = await response.json();
      toastDissmisser(toastId);
      if (response.ok) {
        showSuccessMessage("Analysis Completed!");
        setAnalysisResult({
          summary: data.summary,
          aiProbability: data.aiProbability,
        });
      } else {
        showErrorMessage(data.error || "AI Analysis Failed");
      }
    } catch (error: any) {
      toastDissmisser(toastId);
      showErrorMessage(error.message || "Network Error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveGradeToDB = async () => {
    if (!teacherId) throw new Error("Session expired. Please Log in again.");
    let finalAudioUrl = null;
    const numericGrade = parseFloat(grade);
    if (grade === "" || isNaN(numericGrade)) {
      throw new Error("Please enter a valid numeric grade.");
    }
    if (totalMarks && numericGrade > totalMarks) {
      throw new Error(`Grade cannot be greater than ${totalMarks}`);
    }

    //? (A. Vanshika) Audio uploading to cloudinary....
    if (feedbackMode === "audio" && audioBlob) {
      const toastId = showLoadingMessage("Uploading audio note....");
      try {
        const formData = new FormData();
        //? (A. Vanshika) Cloudnary accepets audio files in "video" field only....
        formData.append("file", audioBlob, "feedback.webm");
        //? (A. Vanshika) Uploading to cloudinary....
        formData.append("upload_preset", "ClassifyAI-pdf");
        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/dd2bczbdo/video/upload`,
          { method: "POST", body: formData },
        );
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok)
          throw new Error(uploadData.error.message || "Audio upload failed");
        finalAudioUrl = uploadData.secure_url;
        toastDissmisser(toastId);
        showSuccessMessage("Audio Uploaded");
      } catch (error) {
        toastDissmisser(toastId);
        throw new Error("Failed to upload audio feedback.");
      }
    }

    const response = await fetch(`/api/teacher/submissions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submissionId: submission.id,
        teacherId: teacherId,
        grade: numericGrade,
        feedback: feedbackMode === "text" ? feedback : "",
        audioFeedbackUrl: finalAudioUrl,
        attachSignature,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Failed to Save Grade");
    }
    return data;
  };

  const handleSave = async () => {
    setIsLoading(true);
    const toastId = showLoadingMessage("Saving Grade...");
    try {
      await saveGradeToDB();
      toastDissmisser(toastId);
      showSuccessMessage("Grade saved successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toastDissmisser(toastId);
      showErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndNext = async () => {
    setIsNextLoading(true);
    const toastId = showLoadingMessage("Saving and moving to next...");
    try {
      await saveGradeToDB();
      toastDissmisser(toastId);
      showSuccessMessage("Grade Saved!");
      onSuccess();
      if (hasNext) {
        onNavigate(allSubmissions[currentIndex + 1]);
      } else {
        onClose();
      }
    } catch (error: any) {
      toastDissmisser(toastId);
      showErrorMessage(error.message || "Internal Server Error");
    } finally {
      setIsNextLoading(false);
    }
  };

  const getPlagiarismColor = (probability: number) => {
    if (probability < 20)
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (probability < 50)
      return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 
    p-8 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)] 
    w-full max-w-[150rem] lg:max-w-[150rem] text-white relative overflow-hidden flex flex-col max-h-[90vh]"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />

          <GradeModalHeader submission={submission} isLate={isLate} />
          <div className="flex gap-6 overflow-hidden">
            <div className="w-1/2 space-y-6 overflow-y-auto pr-2 custom-scrollbar max-h-[65vh]">
              <SubmissionPreview
                submission={submission}
                openInBrowser={openInBrowser}
              />
            </div>
            <div className="w-1/2 space-y-6 overflow-y-auto pr-2 custom-scrollbar max-h-[65vh]">
              <GradeSection
                grade={grade}
                setGrade={setGrade}
                gradeMode={gradeMode}
                setGradeMode={setGradeMode}
                rubric={rubric}
                setRubric={setRubric}
                totalMarks={totalMarks}
              />
              <FeedbackSection
                feedback={feedback}
                setFeedback={setFeedback}
                feedbackMode={feedbackMode}
                setFeedbackMode={setFeedbackMode}
                attachSignature={attachSignature}
                setAttachSignature={setAttachSignature}
                submission={submission}
                setAudioBlob={setAudioBlob}
              />
              <AIAssistantSection
                analysisResult={analysisResult}
                isAnalyzing={isAnalyzing}
                runAIAnalysis={runAIAnalysis}
                getPlagiarismColor={getPlagiarismColor}
              />
            </div>
          </div>
          <ModalFooter
            onClose={onClose}
            handleSave={handleSave}
            handleSaveAndNext={handleSaveAndNext}
            isLoading={isLoading}
            isNextLoading={isNextLoading}
            hasNext={hasNext}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
