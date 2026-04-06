"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  FileQuestion,
  FileText,
  Video,
  Sparkles,
  ExternalLink,
  X,
  Search,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const TABS = [
  { id: "ALL", label: "All Files" },
  { id: "NOTES", label: "Study Notes" },
  { id: "PYQ", label: "PYQs" },
  { id: "SYLLABUS", label: "Syllabus" },
  { id: "VIDEO_LINK", label: "Videos" },
];

export default function StudentStudyVault() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [campusId, setCampusId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResource, setSelectedResource] = useState<any | null>(null);

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

  return (
    <main className="min-h-screen text-white p-6 md:p-10 bg-transparent">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r h-15 from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent flex items-center gap-3">
            <BookOpen size={36} className="text-cyan-400" />
            Study Vault
          </h1>
          <p className="text-gray-400 mt-2">
            Smart learning powered by Classify AI 🚀
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search notes, PYQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-gray-200 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="text-center mt-20 text-cyan-400 animate-pulse">
          Opening Study Vault...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredResources.map((res: any) => (
            <motion.div
              key={res.id}
              whileHover={{ y: -6, scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200 }}
              onClick={() => handleResourceClick(res)}
              className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl cursor-pointer overflow-hidden hover:border-cyan-400/40 transition-all duration-300"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 blur-xl transition" />
              {res.aiSummary?.length > 0 && (
                <div className="absolute top-3 right-3 text-violet-400">
                  <Sparkles size={16} className="animate-pulse" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition">
                  {getIcon(res.resourceType)}
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase">
                    {res.resourceType}
                  </p>
                  <p className="text-xs text-cyan-400 truncate max-w-[140px]">
                    {res.subject?.name}
                  </p>
                </div>
              </div>
              <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 group-hover:text-cyan-300 transition">
                {res.title}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">
                {res.description || "Click to preview"}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedResource && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setSelectedResource(null)}
          >
            <motion.div
              className="w-full max-w-6xl bg-gradient-to-br from-[#0f172a]/90 to-[#020617]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.6)]"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  {selectedResource.title}
                </h2>
                <button
                  onClick={() => setSelectedResource(null)}
                  className="p-2 bg-white/10 rounded-full hover:bg-white/20"
                >
                  <X />
                </button>
              </div>
              <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 h-[70vh]">
                {getFileType(selectedResource.url) === "pdf" && (
                  <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(
                      selectedResource.url,
                    )}&embedded=true`}
                    className="w-full h-full"
                  />
                )}

                {getFileType(selectedResource.url) === "image" && (
                  <img
                    src={selectedResource.url}
                    className="w-full h-full object-contain"
                  />
                )}

                {getFileType(selectedResource.url) === "video" && (
                  <video
                    src={selectedResource.url}
                    controls
                    className="w-full h-full"
                  />
                )}

                {getFileType(selectedResource.url) === "audio" && (
                  <div className="flex items-center justify-center h-full">
                    <audio controls src={selectedResource.url} />
                  </div>
                )}
              </div>
              {selectedResource.aiSummary?.length > 0 && (
                <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5">
                  <h3 className="text-violet-400 font-bold mb-3 flex items-center gap-2">
                    <Sparkles size={16} /> AI Summary
                  </h3>
                  <div className="space-y-2">
                    {selectedResource.aiSummary.map((p: string, i: number) => (
                      <p key={i} className="text-gray-300 text-sm">
                        {i + 1}. {p}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
