"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import {
  BookOpen,
  FileQuestion,
  FileText,
  Video,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
} from "lucide-react";
import ExamPredictor from "@/components/student/ExamPredictor";
import StudyVaultHeader from "@/components/student/study-vault/StudyVaultHeader";
import StudyVaultTabs from "@/components/student/study-vault/StudyVaultTabs";
import { TABS } from "@/lib/helper";
import StudyVaultGrid from "@/components/student/study-vault/StudyVaultGrid";
import ResourceModal from "@/components/student/study-vault/ResourceModal";
import { useRouter } from "next/navigation";
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function StudentStudyVault() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [campusId, setCampusId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<{
    id: string;
    name: string;
  } | null>(null);
  useEffect(() => {
    setStudentId(localStorage.getItem("studentId"));
    setCampusId(localStorage.getItem("CampusID"));
  }, []);

  const { data, isLoading } = useSWR(
    studentId && campusId
      ? `/api/student/resources?studentId=${studentId}&campusId=${campusId}`
      : null,
    fetcher,
  );
  const resources = data?.resources || [];
  const filteredResources = resources.filter((res: any) => {
    const matchesTab = activeTab === "ALL" || res.resourceType === activeTab;
    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });
  const getIcon = (type: string) => {
    switch (type) {
      case "NOTES":
        return <BookOpen className="text-cyan-400" size={22} />;
      case "PYQ":
        return <FileQuestion className="text-purple-400" size={22} />;
      case "VIDEO_LINK":
        return <Video className="text-pink-400" size={22} />;
      default:
        return <FileText className="text-blue-400" size={22} />;
    }
  };
  const getFileType = (url: string) => {
    const lower = url.toLowerCase();
    if (lower.includes(".pdf")) return "pdf";
    if (/\.(png|jpg|jpeg|webp|gif)$/.test(lower)) return "image";
    if (/\.(mp4|webm|ogg)$/.test(lower)) return "video";
    if (/\.(mp3|wav)$/.test(lower)) return "audio";
    return "other";
  };

  const handleResourceClick = (resource: any) => {
    setSelectedResource(resource);
  };

  const subjects = [
    ...new Map(
      resources.map((r: any) => [
        r.subject?.id,
        { id: r.subjectId, name: r.subject?.name },
      ]),
    ).values(),
  ].filter(Boolean);
  const router = useRouter();

  return (
    <main className="min-h-screen text-white p-6 md:p-10 bg-transparent">
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={() => router.push("/dashboard/student")}
          className="flex items-center justify-center p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-lg hover:bg-cyan-500/20 hover:border-cyan-400 text-white transition-all duration-300"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
      <StudyVaultHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <StudyVaultTabs
        TABS={TABS}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {activeTab === "PREDICTOR" ? (
        <div className="mt-8">
          {!selectedSubject ? (
            <div className="text-center p-10 bg-slate-900/50 rounded-3xl border border-white/5">
              <Sparkles className="w-12 h-12 text-violet-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-300 mb-2">
                Select a Subject
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Choose a subject to run AI predictions on its PYQs.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {subjects.map((subject: any, index: number) => {
                  console.log(subject);
                  return (
                    <button
                      key={subject.id || index}
                      onClick={() =>
                        setSelectedSubject({
                          id: subject.id,
                          name: subject.name,
                        })
                      }
                      className="px-5 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 transition font-semibold text-sm"
                    >
                      {subject.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setSelectedSubject(null)}
                className="mb-4 text-sm text-gray-400 hover:text-white transition"
              >
                <ArrowLeft className="inline mr-2" /> Back to subjects
              </button>
              <ExamPredictor
                subjectId={selectedSubject.id}
                subjectName={selectedSubject.name}
              />
            </div>
          )}
        </div>
      ) : isLoading ? (
        <div className="text-center mt-20 text-cyan-400 animate-pulse">
          Opening Study Vault...
        </div>
      ) : (
        <StudyVaultGrid
          filteredResources={filteredResources}
          getIcon={getIcon}
          handleResourceClick={handleResourceClick}
        />
      )}

      <ResourceModal
        selectedResource={selectedResource}
        setSelectedResource={setSelectedResource}
        getFileType={getFileType}
      />
    </main>
  );
}
