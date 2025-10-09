"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { BarChart, TrendingUp, Trophy, UserCheck, UserX } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const StatCard = ({
  title,
  value,
  icon,
  subtext,
  colorGradient,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtext?: string;
  colorGradient: string; // Tailwind gradient class
}) => (
  <div
    className={`relative p-6 rounded-2xl border backdrop-blur-lg shadow-lg hover:scale-105 transition-transform duration-300 ${colorGradient}`}
  >
    <div className="flex items-center gap-4">
      <div className="p-3 rounded-lg bg-white/10 shadow-md">{icon}</div>
      <div>
        <p className="text-sm text-gray-300">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
      </div>
    </div>
    {/* Neon glow animation */}
    <span className="absolute -inset-0.5 rounded-2xl blur opacity-50 animate-pulse bg-gradient-to-r from-white/20 via-white/10 to-white/20"></span>
  </div>
);

export default function AttendanceAnalyticsPage() {
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [campusId, setCampusId] = useState<string | null>(null);

  useEffect(() => {
    setTeacherId(localStorage.getItem("teacherId"));
    setCampusId(localStorage.getItem("CampusID"));
  }, []);

  const { data, error, isLoading } = useSWR(
    teacherId && campusId
      ? `/api/teacher/analytics/attendance?teacherId=${teacherId}&campusId=${campusId}`
      : null,
    fetcher
  );

  const analytics = data?.analytics;

  if (isLoading) {
    return (
      <div className="min-h-screen flex animate-pulse items-center justify-center text-white text-xl font-semibold">
        Loading analytics...
      </div>
    );
  }

  if (error || !data?.success || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 text-lg">
        {data?.message || "Failed to load analytics."}
      </div>
    );
  }
  return (
    <main className="min-h-screen p-8 bg-transparent text-white">
      <header className="mb-12">
        <h1 className="text-4xl 2xl:h-11 font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400">
          Attendance Analytics
        </h1>
        <p className="mt-2 text-gray-400">
          Overview of attendance performance across all your classes.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard
          title="Overall Attendance"
          value={`${analytics.overallAttendancePercentage}%`}
          icon={<BarChart className="text-white" />}
                    colorGradient="bg-gradient-to-tr from-cyan-500/25 via-blue-500/25 to-purple-500/25 border border-cyan-400/40"
        />
        <StatCard
          title="Highest Attending Student"
          value={`${analytics.highestAttendingStudents[0]?.percentage}%`}
          icon={<UserCheck className="text-white" />}
          subtext={analytics.highestAttendingStudents[0]?.name}
           colorGradient="bg-gradient-to-tr from-green-400/50 via-lime-400/50 to-emerald-500/25 border border-green-400/50"
        />
        <StatCard
          title="Lowest Attending Student"
          value={`${analytics.lowestAttendingStudents[0]?.percentage === undefined ? "N/A" : `${analytics.lowestAttendingStudents[0]?.percentage}%`}`}
          icon={<UserX className="text-white" />}
          subtext={analytics.lowestAttendingStudents[0]?.name}
          colorGradient="bg-gradient-to-tr from-red-500/50 via-pink-500/50 to-rose-500/25 border border-red-400/50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-3xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400">
            Performance by Subject
          </h2>
          <div className="rounded-2xl bg-black/30 border border-purple-600/30 backdrop-blur-lg shadow-inner overflow-hidden">
            <ul className="divide-y divide-purple-600/40">
              {analytics.performanceBySubject.length > 0 ? (
                analytics.performanceBySubject.map((item: any) => (
                  <li
                    key={item.subject}
                    className="flex justify-between items-center p-4 hover:bg-purple-500/10 transition-colors rounded-lg"
                  >
                    <span className="font-medium">{item.subject}</span>
                    <span className="font-semibold text-cyan-400">
                      {item.percentage}%
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-center py-8 text-gray-500">
                  No graded assignments yet.
                </li>
              )}
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400">
            Attendance Trend (Last 30 Days)
          </h2>
          <div className="rounded-2xl bg-black/30 border border-purple-600/30 backdrop-blur-lg shadow-inner p-4">
            <div className="max-h-[300px] overflow-y-auto text-sm">
              {analytics.dailyTrend.length > 0 ? (
                analytics.dailyTrend.map((day: any) => (
                  <div
                    key={day.date}
                    className="flex justify-between p-2 hover:bg-blue-500/10 rounded-md transition-colors"
                  >
                    <span className="text-gray-400">
                      {new Date(day.date).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-cyan-400">
                      {day.percentage}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-gray-500">
                  No attendance data in the last 30 days.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
