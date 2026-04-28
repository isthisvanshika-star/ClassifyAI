"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import { BarChart3, BookOpen, School, TrendingUp, TrendingDown } from "lucide-react";
import GlassCard from "./GlassCard";
import CircularProgress from "./CircularProgress";
import TrendIndicator from "./TrendIndicator";
import PulseSkeleton from "./PulseSkeleton";
import ErrorState from "./ErrorState";
import CountUp from "react-countup";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DepartmentPulsePro({
  campusId,
}: {
  campusId: string;
}) {
  const { data, isLoading, error } = useSWR(
    campusId ? `/api/teacher/hod/analytics?campusId=${campusId}` : null,
    fetcher
  );

  if (isLoading) return <PulseSkeleton />;
  if (error || !data) return <ErrorState message="Failed to load analytics" />;

  const attendance = data.averageAttendance.percentage;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <GlassCard>
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-white/70">Average Attendance</p>
          <BarChart3 size={18} className="text-white/60" />
        </div>

        <div className="flex items-center gap-4">
          <CircularProgress value={attendance} />

          <div>
            <h2 className="text-3xl font-bold text-white">
              <CountUp end={attendance} duration={1} />%
            </h2>
            <p className="text-sm text-white/60">
              {data.averageAttendance.present}/
              {data.averageAttendance.total}
            </p>

            <TrendIndicator value={attendance} threshold={75} />
          </div>
        </div>
      </GlassCard>
      <GlassCard>
        <div className="flex justify-between mb-4">
          <p className="text-sm text-white/70">Resources This Week</p>
          <BookOpen size={18} className="text-white/60" />
        </div>

        <h2 className="text-3xl font-bold text-white">
          <CountUp end={data.totalResources.thisWeek} />
        </h2>

        <p className="text-sm text-white/60 mt-2">
          Notes: {data.totalResources.notes} • PYQs: {data.totalResources.pyqs}
        </p>
      </GlassCard>

      <GlassCard>
        <div className="flex justify-between mb-4">
          <p className="text-sm text-white/70">Classes Today</p>
          <School size={18} className="text-white/60" />
        </div>

        <h2 className="text-3xl font-bold text-white">
          <CountUp end={data.classesConducted.today} />
        </h2>

        <p className="text-sm text-white/60 mt-2">
          Live: {data.classesConducted.live} • Upcoming:{" "}
          {data.classesConducted.upcoming}
        </p>
      </GlassCard>
    </div>
  );
}