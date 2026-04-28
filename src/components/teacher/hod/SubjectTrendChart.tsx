"use client";

import useSWR from "swr";
import SubjectChart from "./SubjectChart";
import ChartSkeleton from "./ChartSkeleton";
import ErrorState from "./ErrorState";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SubjectTrendChart({ campusId }: { campusId: string }) {
  const { data, isLoading, error } = useSWR(
    campusId
      ? `/api/teacher/hod/subject-attendance-trend?campusId=${campusId}`
      : null,
    fetcher,
  );

  if (isLoading) return <ChartSkeleton />;
  if (error || !data) return <ErrorState message="Failed to load trends" />;

  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10">
      <h2 className="text-xl font-semibold text-white mb-4">
        📈 Subject Attendance Trend (7 Days)
      </h2>

      <div className="space-y-6">
        {data.subjects.map((subject: any) => (
          <SubjectChart key={subject.subjectId} subject={subject} />
        ))}
      </div>
    </div>
  );
}
