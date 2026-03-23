"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Megaphone, Download, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function StudentAnnouncementsPage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [campusId, setCampusId] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    setStudentId(localStorage.getItem("studentId"));
    setCampusId(localStorage.getItem("CampusID"));
  }, []);

  const { data, error, isLoading } = useSWR(
    studentId && campusId
      ? `/api/student/announcements?studentId=${studentId}&campusId=${campusId}`
      : null,
    fetcher,
  );

  const announcements = data?.announcements || [];

  return (
    <main className="min-h-screen  p-8 text-white">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-center text-cyan-400">
          Announcements
        </h1>
        <p className="mt-2 text-gray-400 text-center text-sm">
          Important updates and messages from your teachers and management.
        </p>
      </header>

      {/* Loading / Error */}
      {isLoading && (
        <p className="text-center text-gray-500">Loading announcements...</p>
      )}
      {error && (
        <p className="text-center text-red-400">
          Failed to load announcements. Please refresh.
        </p>
      )}

      {/* Announcements List */}
      {!isLoading && !error && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {announcements.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <Megaphone size={48} className="mx-auto mb-4 text-cyan-400" />
              <p className="text-gray-400">No new announcements right now.</p>
            </div>
          ) : (
            announcements.map((announcement: any) => (
              <div
                key={announcement.id}
                className="bg-transparent  backdrop-blur-3xl p-6 rounded-2xl border border-gray-700 shadow-lg hover:shadow-cyan-500/30 transition-shadow duration-300"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-cyan-300">
                      {announcement.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      By {announcement.author.user.name} on{" "}
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs font-semibold bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full">
                    {announcement.targetAll ? "General" : "For Your Class"}
                  </span>
                </div>

                <p className="mt-4 text-gray-300 whitespace-pre-wrap">
                  {announcement.message}
                </p>

                {announcement.attachments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="text-sm font-semibold mb-2 text-gray-400">
                      Attachments:
                    </h4>
                    <div className="flex flex-col gap-2">
                      {announcement.attachments.map((file: any) => (
                        <a
                          key={file.url}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 hover:underline transition-colors duration-200"
                        >
                          <Download size={16} />
                          <span>{file.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => router.push("/dashboard/student")}
          className="flex items-center justify-center p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-lg hover:bg-cyan-500/20 hover:border-cyan-400 text-white transition-all duration-300"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
    </main>
  );
}
