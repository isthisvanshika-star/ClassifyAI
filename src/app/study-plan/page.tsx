"use client";

import { useState } from "react";
import {
  Sparkles,
  ClipboardList,
  CalendarCheck,
  Lightbulb,
  CalendarClock,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

const StudyPlanPage = () => {
  const [syllabus, setSyllabus] = useState("");
  const [examDate, setExamDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [planData, setPlanData] = useState<{
    roadmap: string[];
    importantTopics: string[];
    importantQuestions: string[];
    studyPlan: Record<string, string>;
  } | null>(null);
  const router = useRouter();
  const handleGenerate = async () => {
    if (!syllabus.trim()) return;

    setProgress(0);
    setLoading(true);

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 150);

    try {
      const res = await fetch(`/api/study-plan/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syllabus, examDate }),
      });

      const data = await res.json();
      if (data.success) {
        setPlanData(data.data);
        setProgress(100);
      }
    } catch (err) {
      console.error("Failed to generate plan:", err);
    } finally {
      setTimeout(() => {
        setLoading(false); // Hide loading after showing 100%
      }, 1000);
    }
  };
  if (loading) {
    const radius = 60;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 0.5;
    const circumference = 2 * Math.PI * normalizedRadius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black/5 text-cyan-400">
        <div className="relative w-36 h-36">
          {/* Circular progress */}
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 36 36"
          >
            <circle
              cx="18"
              cy="18"
              r="16"
              stroke="#1e293b"
              strokeWidth="3"
              fill="none"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              stroke="#06b6d4"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              strokeDasharray="100"
              strokeDashoffset={`${100 - progress}`}
            />
          </svg>

          {/* Logo centered absolutely */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/only-logo.png"
              alt="ClassifyAI"
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>

        <p className="mt-6 text-xl font-semibold">
          Generating Your Study Plan...
        </p>
        <p className="text-sm text-cyan-300">{progress}%</p>
      </div>
    );
  }

  return (
    <div className=" mx-auto py-10 px-4">
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => router.push("/dashboard/student")}
          className="flex items-center justify-center gap-2 rounded-full  text-white hover:text-cyan-300 transition-colors"
        >
          <ChevronLeft size={32} />
        </button>
      </div>
      {!planData && (
        <div className="max-w-6xl 2xl:h-[55rem] h-[40rem] mx-auto bg-white/5 border-4 border-cyan-100/20 rounded-3xl shadow-xl p-4 backdrop-blur-md ">
          <h1 className="text-2xl font-bold text-cyan-300 mb-2 text-center">
             Make Study Plan
          </h1>
          <p className="text-center text-cyan-100 mb-6">
            Let us craft the perfect plan for you. Paste your syllabus, pick
            your exam date, and hit generate!
          </p>

          {/* Syllabus */}
          <div className="relative w-full mb-6">
            <textarea
              placeholder="📄 Paste your syllabus"
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              rows={10}
className="peer w-full placeholder:text-cyan-50 p-4 border 2xl:h-[35rem] h-[25rem] border-cyan-300/30 rounded-xl bg-gray-900/5 text-cyan-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500 transition resize-none"
            />
            <p className="text-xs text-cyan-300 mt-1">
              We recommend copying your syllabus exactly as provided by your
              teacher.
            </p>
          </div>

          {/* Exam Date */}
          <div className="relative w-full mb-6">
            <input
              id="examDate"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="peer w-full p-4 border border-cyan-300/30 rounded-xl bg-gray-900/5 text-cyan-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500 transition placeholder-transparent"
              placeholder="📅 Exam Date"
            />
            <p className="text-xs text-cyan-300 mt-1">
              Select the date of your final exam.
            </p>
          </div>

          {/* Button */}
          <button
            disabled={loading}
            onClick={handleGenerate}
            className="group w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-6 py-2 rounded-xl font-semibold shadow-lg transform transition hover:-translate-y-1 hover:shadow-cyan-500/30 active:scale-95"
          >
            <span className="inline-flex items-center gap-2">
              ✨ Generate Study Plan
            </span>
          </button>
        </div>
      )}

      {/* 🟩 Show STUDY PLAN */}
      {planData && (
        <div className="mt-5 space-y-4 gap-3 flex h-180">
          <section className="bg-white/5 border border-cyan-100/20 rounded-lg  overflow-scroll overflow-y-auto p-3">
            <div className="flex items-center gap-2 mb-2 max-h-24">
              <CalendarCheck className="text-blue-300" />
              <h2 className="text-md font-semibold text-cyan-200">
                Daily Study Plan
              </h2>
            </div>
            <ul className="list-decimal text-md pl-5 text-gray-300 space-y-3.5">
              {Object.entries(planData.studyPlan).map(([day, content]) => (
                <li key={day}>
                  <strong>{day}:</strong> {content}
                </li>
              ))}
            </ul>
          </section>
          <div>
            <section className="bg-white/5 border border-cyan-100/20 h-100 rounded-lg overflow-scroll overflow-y-auto p-3">
              <div className="flex items-center gap-2 mb-5 overflow-scroll scrollbar-hide max-h-24">
                <Sparkles className="text-yellow-300" />
                <h2 className="text-md font-semibold text-cyan-200">
                  Study Roadmap
                </h2>
              </div>
              <ul className="list-disc pl-5 text-gray-300 space-y-3.5">
                {planData.roadmap.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </section>
            <div className="flex gap-5 mt-5 h-[17.7rem]">
              <section className="bg-white/5 border border-cyan-100/20 rounded-lg overflow-scroll overflow-y-auto p-3">
                <div className="flex items-center gap-2 mb-5">
                  <Lightbulb className="text-green-300" />
                  <h2 className="text-md font-semibold text-cyan-200">
                    Important Topics
                  </h2>
                </div>
                <ul className="list-disc pl-5 text-gray-300 space-y-2">
                  {planData.importantTopics.map((topic, idx) => (
                    <li key={idx}>{topic}</li>
                  ))}
                </ul>
              </section>

              <section className="bg-white/5 border border-cyan-100/20 rounded-lg overflow-scroll overflow-y-auto p-3">
                <div className="flex items-center gap-2 mb-5 ">
                  <ClipboardList className="text-pink-400" />
                  <h2 className="text-md font-semibold text-cyan-200">
                    Important Questions
                  </h2>
                </div>
                <ul className="list-decimal pl-5 text-gray-300 space-y-1">
                  {planData.importantQuestions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanPage;
