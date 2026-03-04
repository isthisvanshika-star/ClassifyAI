"use client";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { useEffect, useState } from "react";
import AssignmentHeader from "@/components/teacher/assignments/AssignmentHeader";
import AssignmentAnalytics from "@/components/teacher/assignments/AssignmentAnalytics";
import SubmissionTable from "@/components/teacher/assignments/SubmissionTable";
import GradeSubmissionModal from "@/components/teacher/GradeSubmissionModal";
import { showErrorMessage, showLoadingMessage, showSuccessMessage, toastDissmisser } from "@/lib/helper";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AssignmentDetailPage() {
  const params = useParams();
  const assignmentId = params.assignmentId as string;
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [campusId, setCampusId] = useState<string | null>(null);
  const [submissionToGrade, setSubmissionToGrade] = useState<any | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  useEffect(() => {
    setTeacherId(localStorage.getItem("teacherId"));
    setCampusId(localStorage.getItem("CampusID"));
  }, []);

  const { data: assignmentData, mutate: mutateAssignment, isLoading: aLoading } = useSWR(
    assignmentId && teacherId && campusId ? `/api/teacher/assignments?assignmentId=${assignmentId}&teacherId=${teacherId}&campusId=${campusId}` : null, fetcher
  );

  const { data: analyticsData, isLoading: bLoading } = useSWR(
    assignmentId && teacherId ? `/api/teacher/assignments/analytics?assignmentId=${assignmentId}&teacherId=${teacherId}` : null, fetcher
  );

  const handleStatusChange = async (newStatus: "PUBLISHED" | "DRAFT") => {
    setIsStatusLoading(true);
    const toastId = showLoadingMessage("Updating status...");
    try {
      const res = await fetch("/api/teacher/assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, teacherId, campusId, status: newStatus }),
      });
      const data = await res.json();
      toastDissmisser(toastId);
      if (res.ok) {
        showSuccessMessage("Status updated!");
        mutateAssignment();
      } else {
        showErrorMessage(data.error || "Failed to update status.");
      }
    } catch {
      toastDissmisser(toastId);
      showErrorMessage("Network error.");
    } finally {
      setIsStatusLoading(false);
    }
  };

  if (aLoading || bLoading) return <div className="p-20 text-center text-white">Loading...</div>;
  if (!assignmentData?.assignment) return <div className="p-20 text-center text-red-500">Error loading data.</div>;

  const { assignment } = assignmentData;

  return (
    <main className="min-h-screen p-8 text-white">
      <AssignmentHeader assignment={assignment} handleStatusChange={handleStatusChange} isStatusLoading={isStatusLoading} />
      {analyticsData?.analytics && <AssignmentAnalytics analytics={analyticsData.analytics} />}
      <SubmissionTable 
        submissions={assignment.submissions} 
        dueDate={assignment.dueDate} 
        totalMarks={assignment.totalMarks} 
        onGrade={setSubmissionToGrade} 
      />
      {submissionToGrade && (
        <GradeSubmissionModal
          isOpen={!!submissionToGrade}
          onClose={() => setSubmissionToGrade(null)}
          onSuccess={() => mutateAssignment()}
          submission={submissionToGrade}
          totalMarks={assignment.totalMarks}
        />
      )}
    </main>
  );
}