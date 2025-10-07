"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { BarChart, TrendingUp, Trophy, UserCheck, UserX } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const StatCard = ({ title, value, icon, subtext }: { title: string, value: string | number, icon: React.ReactNode, subtext?: string }) => (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center gap-4">
            <div className="bg-indigo-600/20 p-3 rounded-lg">{icon}</div>
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
                {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
            </div>
        </div>
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
    teacherId && campusId ? `/api/teacher/analytics/attendance?teacherId=${teacherId}&campusId=${campusId}` : null,
    fetcher
  );

  const analytics = data?.analytics;

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 text-white p-8 text-center">Loading analytics...</div>;
  }

  if (error || !data?.success || !analytics) {
    return <div className="min-h-screen bg-gray-900 text-red-400 p-8 text-center">{data?.message || "Failed to load analytics."}</div>;
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-indigo-400">Attendance Analytics</h1>
        <p className="mt-2 text-gray-400">An overview of attendance performance across all your classes.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
            title="Overall Attendance" 
            value={`${analytics.overallAttendancePercentage}%`} 
            icon={<BarChart className="text-indigo-300"/>} 
        />
        <StatCard 
            title="Highest Attending Student" 
            value={`${analytics.highestAttendingStudent.percentage}%`} 
            icon={<UserCheck className="text-green-400"/>}
            subtext={analytics.highestAttendingStudent.name}
        />
        <StatCard 
            title="Lowest Attending Student" 
            value={`${analytics.lowestAttendingStudent.percentage}%`} 
            icon={<UserX className="text-red-400"/>}
            subtext={analytics.lowestAttendingStudent.name}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <section>
            <h2 className="text-2xl font-semibold mb-4">Performance by Subject</h2>
            <div className="bg-gray-800 rounded-lg border border-gray-700">
                <ul className="divide-y divide-gray-700">
                    {analytics.performanceBySubject.length > 0 ? (
                        analytics.performanceBySubject.map((item: any) => (
                            <li key={item.subject} className="flex justify-between items-center p-4">
                                <span className="font-medium">{item.subject}</span>
                                <span className="font-semibold text-cyan-400">{item.averageGrade}%</span>
                            </li>
                        ))
                    ) : (
                        <li className="text-center py-8 text-gray-500">No graded assignments yet.</li>
                    )}
                </ul>
            </div>
        </section>

        <section>
            <h2 className="text-2xl font-semibold mb-4">Attendance Trend (Last 30 Days)</h2>
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                {/* This is where you would place a line chart component */}
                <div className="max-h-[300px] overflow-y-auto text-sm">
                    {analytics.dailyTrend.length > 0 ? (
                        analytics.dailyTrend.map((day: any) => (
                            <div key={day.date} className="flex justify-between p-2 hover:bg-gray-700/50 rounded-md">
                                <span className="text-gray-400">{new Date(day.date).toLocaleDateString()}</span>
                                <span className="font-semibold">{day.percentage}%</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-center py-8 text-gray-500">No attendance data in the last 30 days.</p>
                    )}
                </div>
            </div>
        </section>

      </div>
    </main>
  );
}