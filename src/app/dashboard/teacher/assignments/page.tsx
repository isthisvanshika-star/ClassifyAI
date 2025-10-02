"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { PlusCircle } from "lucide-react";
import CreateAssignmentModal from "@/components/teacher/CreateAssignmentModal";
import { AssignmentStatus } from "@/lib/types";
import Link from "next/link";

const statusColors: Record<AssignmentStatus, string> = {
  DRAFT: "bg-gray-600/70 text-white",
  PUBLISHED: "bg-green-600/80 text-white",
  CLOSED: "bg-red-600/80 text-white",
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AssignmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [campusId, setCampusId] = useState<string | null>(null);
  useEffect(() => {
    setTeacherId(localStorage.getItem("teacherId"));
    setCampusId(localStorage.getItem("CampusID"));
  }, []);

  const { data, error, isLoading, mutate } = useSWR(
    teacherId && campusId
      ? `/api/teacher/assignments?teacherId=${teacherId}&campusId=${campusId}`
      : null,
    fetcher
  );

  const assignments = data?.assignments || [];

  return (
    <>
      <main className="min-h-screen bg-transparent  text-white p-8">
        {/* HEADER */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold 2xl:h-[2.7rem] bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Assignments
            </h1>
            <p className="mt-2 text-gray-400 text-sm">
              Create and manage your class assignments with ease.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-105 transition-transform text-white font-bold py-2 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <PlusCircle size={20} />
            Create Assignment
          </button>
        </header>

        {/* LOADING / ERROR STATES */}
        {isLoading && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-gray-800/40 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-lg animate-pulse flex flex-col"
      >
        {/* Title + status */}
        <div className="flex justify-between items-start mb-3">
          <div className="h-6 w-1/2 bg-gray-700/70 rounded-lg"></div>
          <div className="h-5 w-16 bg-gray-700/70 rounded-full"></div>
        </div>

        {/* Subject name */}
        <div className="h-4 w-1/3 bg-gray-700/60 rounded-lg mb-2"></div>

        {/* Due date */}
        <div className="h-3 w-1/4 bg-gray-700/50 rounded-lg"></div>

        {/* Bottom stats */}
        <div className="mt-5 pt-4 border-t border-gray-700 flex justify-between items-center">
          <div className="h-4 w-24 bg-gray-700/60 rounded-lg"></div>
          <div className="h-4 w-12 bg-gray-700/50 rounded-lg"></div>
        </div>
      </div>
    ))}
  </div>
)}
        {error && (
          <p className="text-center text-red-400">
            Failed to load assignments.
          </p>
        )}

        {/* ASSIGNMENTS GRID */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {assignments.length === 0 ? (
              <p className="col-span-full  text-center text-gray-500 mt-40 text-xl">
                No assignments yet. Start by creating one!
                <img
                  src="/cyan-free-arrow.png"
                  alt="arrow"
                  className="h-52 absolute right-60 top-40 w-64"
                />
              </p>
            ) : (
              assignments.map((assignment: any) => (
                <Link href={`/dashboard/teacher/assignments/${assignment.id}`} key={assignment.id}>
                  <div
                    className="bg-white-900/70 backdrop-blur-xl border border-gray-800 hover:border-indigo-500 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-indigo-500/20 flex flex-col"
                  >
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-white">
                          {assignment.title}
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full ${
                            statusColors[assignment.status as AssignmentStatus]
                          }`}
                        >
                          {assignment.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-400">
                        {assignment.subject?.name || "No subject"}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Due:{" "}
                        {assignment.dueDate
                          ? new Date(assignment.dueDate).toLocaleDateString()
                          : "No due date"}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-700 flex justify-between items-center">
                      <span className="text-sm font-medium text-cyan-400">
                        {assignment._count.submissions} Submissions
                      </span>
                      {assignment.totalMarks && (
                        <span className="text-sm text-gray-400">
                          / {assignment.totalMarks} Marks
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </main>

      {/* MODAL */}
      <CreateAssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => mutate()}
      />
    </>
  );
}
