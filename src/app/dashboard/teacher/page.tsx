"use client";

import React, { useState, useEffect, Suspense } from "react";
import { showErrorMessage } from "@/lib/helper";
import { TeacherDetails, Subject, ClassSession, AttendanceSessionType } from "@/lib/types";

import DashboardSkeleton from "@/components/teacher/DashboardSkeleton";
import DashboardHeader from "@/components/teacher/DashboardHeader";
import {
  QuickActionsCard,
  SubjectsCard,
  ScheduleCard,
  AttendanceSession,
} from "@/components/teacher/ActionCards";
import GenerateTokenDialog from "@/components/teacher/GenerateTokenDialog";
import AttendanceFinalizer from "@/components/teacher/AttendanceFinalizer";
import ActiveSessionTracker from "@/components/teacher/ActiveSessionTracker";

export default function TeacherDashboardPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [attendance, setAttendance] = useState<AttendanceSessionType[]>([]);
  const [details, setDetails] = useState<TeacherDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // State to control which modal is open
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [activeSessionToken, setActiveSessionToken] = useState<string | null>(
    null
  );
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);

  useEffect(() => {
    const teacherUserId = localStorage.getItem("teacherId");
    const campusId = localStorage.getItem("CampusID");
    if (!teacherUserId) {
      showErrorMessage("No teacher ID found. Please log in.");
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [detailsRes, subjectsRes, timetableRes, attendanceSessionRes] = await Promise.all([
          fetch(
            `/api/teacher/id/details?teacherId=${teacherUserId}&campusId=${campusId}`
          ),
          fetch(
            `/api/teacher/subjects?teacherId=${teacherUserId}&campusId=${campusId}`
          ),
          fetch(
            `/api/timetable?teacherId=${teacherUserId}&campusId=${campusId}`
          ),
          fetch(
            `/api/attendance/session?teacherId=${teacherUserId}&campusId=${campusId}`
          ),
        ]);
        if (!detailsRes.ok || !subjectsRes.ok || !timetableRes.ok || !attendanceSessionRes.ok) {
          throw new Error("Failed to load dashboard data.");
        }

        const detailsData = await detailsRes.json();
        const subjectsData = await subjectsRes.json();
        const timetableData = await timetableRes.json();
        const attendanceData = await attendanceSessionRes.json();

        setDetails(detailsData);
        const formattedSubjects: Subject[] = subjectsData.map((item: any) => ({
          id: item.subject.id,
          name: item.subject.name,
          code: item.subject.code,
        }));
        setSubjects(formattedSubjects);
        setClasses(timetableData.sessions || []);
        setAttendance(attendanceData.sessions || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        showErrorMessage("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  if (loading) {
    return <DashboardSkeleton />;
  }

  const handleTimerEnd = () => {
    setIsFinalizeModalOpen(true);
  };

  const handleFinalizeClose = () => {
    setIsFinalizeModalOpen(false);
    setActiveSessionToken(null); // Fully end the session
  };

  const todayWeekday = new Date()
    .toLocaleString("en-US", { weekday: "long" })
    .toUpperCase();
  const todaysClasses = classes.filter((cls) => cls.weekday === todayWeekday);
  const todaysAttendanceSessions = attendance.filter((att) => att.weekday === todayWeekday);
  console.log({details})
  return (
    <>
      <main className=" text-white p-8 overflow-hidden">
        <DashboardHeader
          teacherName={details?.name || "Teacher"}
          teacherDesignation={details?.teacherProfile?.designation || "Teacher"}
          teacherDepartment={details?.teacherProfile?.department || "Department"}
          onGenerateQrClick={() => setIsGenerateModalOpen(true)}
        />
        {/* The on-page timer will appear here when a session is active */}
        {activeSessionToken && (
          <ActiveSessionTracker
            durationInSeconds={300} // 5 minutes
            onTimerEnd={handleTimerEnd}
          />
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <QuickActionsCard />
            <SubjectsCard subjects={subjects} />
          </div>
          <div className="lg:col-span-1 2xl:space-y-2">
            <ScheduleCard classes={todaysClasses} />
          </div>
        </div>
            <AttendanceSession attendanceSessions={todaysAttendanceSessions} />
      </main>

      <Suspense fallback={<div>Loading...</div>}>
        <GenerateTokenDialog
          isOpen={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
          onSuccess={(token) => {
            setIsGenerateModalOpen(false); // Close the first dialog
            setActiveSessionToken(token); // Set token to open the second dialog
          }}
        />
        {isFinalizeModalOpen && activeSessionToken && (
          <AttendanceFinalizer
            token={activeSessionToken}
            onClose={handleFinalizeClose}
          />
        )}
      </Suspense>
    </>
  );
}
