"use client";
import { Exam } from "@/lib/types";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = () => {
     const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const campusId = localStorage.getItem("CampusID");
    const fetchExams = async () => {
      try {
        const res = await fetch(`/api/exam?campusId=${campusId}`);
        const data = await res.json();
        if (data.success) setExams(data.exams);
      } catch (err) {
        console.error("Failed to load exams:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);
  return (
    <div>
      <div className="max-w-3xl mx-auto p-4 grid place-items-center">
        <h1 className="text-5xl text-center font-bold text-cyan-300 mb-6">
          Upcoming Exams
        </h1>

        {loading && <p className="text-gray-400">Loading exams...</p>}

        {!loading && exams.length === 0 && (
          <p className="text-gray-500">No upcoming exams found.</p>
        )}

        <ul className="space-y-4">
          {exams.map((exam) => (
            <li
              key={exam.id}
              className="bg-yellow-cyan/10 border border-cyan-300/30 text-cyan-100 p-4 rounded-xl"
            >
              <h2 className="text-lg font-semibold">{exam.title}</h2>
              <p className="text-sm">{exam.description}</p>
              <p className="text-xs italic mt-1">
                {new Date(exam.date).toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </li>
          ))}
        </ul>
      </div>
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => router.push("/dashboard/student")}
          className="flex items-center justify-center gap-2 rounded-full  text-white hover:text-cyan-300 transition-colors"
        >
          <ChevronLeft size={40} />
        </button>
      </div>
    </div>
  );
};

export default Page;
