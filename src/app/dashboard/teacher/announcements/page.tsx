"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { PlusCircle, Megaphone } from "lucide-react";
import toast from "react-hot-toast";
import CreateAnnouncementModal from "@/components/teacher/CreateAnnouncementModal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AnnouncementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [campusId, setCampusId] = useState<string | null>(null);

  useEffect(() => {
    setTeacherId(localStorage.getItem("teacherId"));
    setCampusId(localStorage.getItem("campusId"));
  }, []);

  const { data, error, isLoading, mutate } = useSWR(
    teacherId && campusId ? `/api/teacher/announcements?teacherId=${teacherId}&campusId=${campusId}` : null,
    fetcher
  );

  const announcements = data?.announcements || [];

  return (
    <>
      <main className="min-h-screen bg-gray-900 text-white p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-indigo-400">Announcements</h1>
            <p className="mt-2 text-gray-400">Broadcast messages to your students.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Create New Announcement
          </button>
        </header>

        {isLoading && <p className="text-center text-gray-400">Loading announcements...</p>}
        {error && <p className="text-center text-red-400">Failed to load announcements.</p>}

        {!isLoading && !error && (
          <div className="space-y-6">
            {announcements.length === 0 ? (
                <p className="text-center text-gray-500 mt-16">You haven't created any announcements yet.</p>
            ) : (
                announcements.map((announcement: any) => (
                    <div key={announcement.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">{announcement.title}</h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    Posted on: {new Date(announcement.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <span className="text-xs font-semibold bg-indigo-600/50 text-indigo-300 px-3 py-1 rounded-full">
                                Target: {announcement.targetAll ? 'All Students' : `Sem ${announcement.targetSemester} / Sec ${announcement.targetSection}`}
                            </span>
                        </div>
                        <p className="mt-4 text-gray-300 whitespace-pre-wrap">{announcement.message}</p>
                    </div>
                ))
            )}
          </div>
        )}
      </main>

      <CreateAnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // Re-fetch the data after a new announcement is created
          mutate();
        }}
      />
    </>
  );
}