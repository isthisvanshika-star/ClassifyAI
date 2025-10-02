"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Users, Calendar } from "lucide-react";
import { TeacherClassSession } from "@/lib/types";
import { showErrorMessage, showSuccessMessage } from "@/lib/helper";
import GenerateTokenDialog from "@/components/teacher/GenerateTokenDialog";
import AttendanceFinalizer from "@/components/teacher/AttendanceFinalizer";

export default function ClassesPage() {
  const [classes, setClasses] = useState<TeacherClassSession[]>([]);
  const [loading, setLoading] = useState(true);

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [preselectedClass, setPreselectedClass] = useState<any | null>(null);

  const router = useRouter();

  useEffect(() => {
    const teacherId = localStorage.getItem("teacherId");
    const campusId = localStorage.getItem("CampusID");

    if (!teacherId || !campusId) {
      showErrorMessage("Session invalid. Please log in again.");
      setLoading(false);
      return;
    }

    const fetchClasses = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/teacher/classes?teacherId=${teacherId}&campusId=${campusId}`);
        const data = await res.json();

        if (res.ok) {
          setClasses(data.classes || []);
        } else {
          throw new Error(data.error || "Failed to fetch classes");
        }
      } catch (error: any) {
        showErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleTakeAttendance = (cls: TeacherClassSession) => {
    setPreselectedClass({
        subjectId: cls.subject.id,
        semesterId: cls.semester.id,
        sectionId: cls.section.id
    });
    setIsGenerateModalOpen(true);
  };




  if (loading) {
    // Skeleton loader
    return (
      <div className="min-h-screen p-8">
        <div className="mb-10 space-y-4 max-w-6xl mx-auto">
          {/* Header skeleton */}
          <div className="h-10 w-1/3 bg-gray-700/60 rounded-lg animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-700/50 rounded-lg animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-gray-800/40 backdrop-blur-xl border border-gray-700 shadow-lg space-y-4 animate-pulse"
            >
              <div className="h-6 w-3/4 bg-gray-700/70 rounded-lg"></div>
              <div className="h-4 w-1/2 bg-gray-700/60 rounded-lg"></div>
              <div className="h-4 w-2/3 bg-gray-700/50 rounded-lg"></div>
              <div className="h-10 w-full bg-gray-700/60 rounded-lg mt-4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
 <>
      <main className="min-h-screen p-8">
        <header className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Your Weekly Schedule
          </h1>
          <p className="mt-2 text-gray-400">Select a class to begin an attendance session.</p>
        </header>

        {classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="bg-gray-800/40 backdrop-blur-xl border border-gray-700 hover:border-indigo-500 rounded-2xl p-6 flex flex-col justify-between shadow-lg transition-all"
              >
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {cls.subject?.name}{" "}
                    {cls.subject?.code && (
                      <span className="text-gray-400 text-sm">({cls.subject.code})</span>
                    )}
                  </h2>
                  <div className="mt-3 space-y-2 text-sm text-gray-300">
                      <p className="flex items-center gap-2"><Users size={14} /> {cls.semester?.name.includes('Semester') ? cls.semester?.name : 'Semester ' + cls.semester?.name} • {cls.section?.name}</p>
                      <p className="flex items-center gap-2"><Calendar size={14} /> {cls.weekday}</p>
                      <p className="flex items-center gap-2">
                          <Clock size={14} />
                          {new Date(cls.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(cls.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                  </div>
                </div>

                <button
                  onClick={() => handleTakeAttendance(cls)}
                  className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-105 transition-transform text-white font-semibold py-2 rounded-xl shadow-md"
                >
                  Take Attendance
                </button>
              </div>
            ))}
          </div>
        ) : (
            <div className="text-center mt-20 space-y-4">
              <div className="text-6xl">📚</div>
              <p className="text-gray-500 text-lg">You have not been assigned to any classes yet.</p>
            </div>
        )}
      </main>

      {/* --- 3. ADD the modal rendering logic --- */}
      <Suspense fallback={null}>
        <GenerateTokenDialog
          isOpen={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
          onSuccess={(classSessionId) => {
            setIsGenerateModalOpen(false);
            setActiveSessionId(classSessionId);
          }}
          preselectedClass={preselectedClass}
        />
        {activeSessionId && (
          <AttendanceFinalizer
            token={activeSessionId} 
            onClose={() => setActiveSessionId(null)}
          />
        )}
      </Suspense>
    </>
  );
}
