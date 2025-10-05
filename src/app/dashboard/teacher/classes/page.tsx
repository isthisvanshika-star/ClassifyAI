"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Users, Calendar, BookOpen } from "lucide-react";
import { TeacherClassSession } from "@/lib/types";
import { showErrorMessage } from "@/lib/helper";
import GenerateTokenDialog from "@/components/teacher/GenerateTokenDialog";
import AttendanceFinalizer from "@/components/teacher/AttendanceFinalizer";
import { motion } from "framer-motion";
import { ClassesLoadingSkeleton } from "@/components/teacher/SkeletonLoaders";

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
      sectionId: cls.section.id,
    });
    setIsGenerateModalOpen(true);
  };

  if (loading) {
    return (
      <ClassesLoadingSkeleton />
    );
  }

  return (
    <>
      <main className="min-h-screen p-8 bg-transparent text-white">
        <header className="mb-10 text-start">
          <h1 className="text-4xl h-11 font-extrabold bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]">
            Your Weekly Schedule
          </h1>
          <p className="mt-2 text-gray-400">
            Manage your classes and take attendance in one place.
          </p>
        </header>

        {classes.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {classes.map((cls, index) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative p-[1px] rounded-2xl bg-gradient-to-r from-indigo-500/40 via-cyan-500/40 to-blue-500/40"
              >
                <div className="rounded-2xl bg-[#0f172a]/80 backdrop-blur-xl p-6 flex flex-col justify-between h-full border border-white/10 shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="text-cyan-400" size={20} />
                      <h2 className="text-xl font-semibold text-white">
                        {cls.subject?.name}
                      </h2>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p className="flex items-center gap-2">
                        <Users size={14} className="text-indigo-400" />
                        {cls.semester?.name.includes("Semester")
                          ? cls.semester?.name
                          : "Semester " + cls.semester?.name}{" "}
                        • {cls.section?.name}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar size={14} className="text-cyan-400" />{" "}
                        {cls.weekday}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock size={14} className="text-blue-400" />
                        {new Date(cls.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(cls.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleTakeAttendance(cls)}
                    className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold py-2 rounded-xl shadow-lg transition-all"
                  >
                    Take Attendance
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center mt-20 space-y-4">
            <div className="text-6xl">📚</div>
            <p className="text-gray-500 text-lg">
              You have not been assigned to any classes yet.
            </p>
          </div>
        )}
      </main>

      {/* --- Modals --- */}
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
