"use client";

import DefaulterRadar from "@/components/teacher/hod/DefaulterRadar";
import DepartmentPulse from "@/components/teacher/hod/DepartmentPulse";
import SubjectTrendChart from "@/components/teacher/hod/SubjectTrendChart";
import TeacherLeaderboard from "@/components/teacher/hod/TeacherLeaderboard";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [campusId, setCampusId] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  useEffect(() => {
    setCampusId(localStorage.getItem("CampusID"));
    setTeacherId(localStorage.getItem("teacherId"));
  }, []);

  if (!campusId || !teacherId) {
    return (
      <div className="h-screen flex items-center justify-center text-white text-xl animate-pulse">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className=" bg-transparent text-white p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">HOD Dashboard ⚡</h1>
        <p className="text-sm text-white/50">
          Real-time analytics & monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DepartmentPulse campusId={campusId} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <DefaulterRadar campusId={campusId} teacherId={teacherId} />
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <TeacherLeaderboard campusId={campusId} teacherId={teacherId} />
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <SubjectTrendChart campusId={campusId} />
      </div>
    </div>
  );
};

export default Page;
