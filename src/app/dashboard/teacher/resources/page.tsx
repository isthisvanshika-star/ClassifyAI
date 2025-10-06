"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { PlusCircle, File, Trash2 } from "lucide-react";
import UploadResourceModal from "@/components/teacher/UploadResourceModal";
import ResourcePreviewModal from "@/components/teacher/ResourcePreviewModal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ResourcesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [campusId, setCampusId] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  useEffect(() => {
    const tId = localStorage.getItem("teacherId");
    const cId = localStorage.getItem("CampusID");
    setTeacherId(tId);
    setCampusId(cId);
  }, []);

  const { data, error, isLoading, mutate } = useSWR(
    teacherId && campusId
      ? `/api/teacher/resources?teacherId=${teacherId}&campusId=${campusId}`
      : null,
    fetcher
  );

  const resources = data?.resources || [];

  return (
    <>
      <main className="min-h-screen text-white p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
              Course Resources
            </h1>
            <p className="mt-2 text-gray-400 text-sm">
              Upload, manage, and share course materials effortlessly.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="relative overflow-hidden group bg-gradient-to-r cursor-pointer from-violet-500 via-blue-500 to-cyan-500 text-white font-semibold py-2 px-5 rounded-xl flex items-center gap-2 shadow-lg transition-all duration-300 hover:scale-[1.05]"
          >
            <PlusCircle
              size={20}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
            <span>Upload Resource</span>
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 blur-md transition duration-500"></span>
          </button>
        </header>
        {isLoading && (
          <p className="text-center text-gray-400 animate-pulse">
            Loading resources...
          </p>
        )}
        {error && (
          <p className="text-center text-red-400">
            Failed to load resources. Please try again later.
          </p>
        )}
        {!isLoading && !error && (
          <>
            {resources.length === 0 ? (
              <div className="text-center text-gray-500 mt-16">
                <p className="text-lg">
                  You haven’t uploaded any resources yet.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Click “Upload Resource” to get started!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {resources.map((resource: any) => (
                  <div
                    key={resource.id}
                    className="relative bg-white/5 border border-white/10 backdrop-blur-xl p-5 rounded-2xl shadow-lg hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-cyan-500/30 to-violet-500/30 p-3 rounded-xl">
                          <File className="w-6 h-6 text-cyan-300" />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-bold text-white text-lg truncate">
                            {resource.title}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {resource.subject.name}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-300 mt-4 line-clamp-3">
                        {resource.description}
                      </p>
                    </div>
                    <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center">
                      <button
                        onClick={() => {
                          setSelectedResource(resource);
                          setIsPreviewOpen(true);
                        }}
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        View
                      </button>
                      <button
                        className="group p-[2px] rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 hover:scale-110 transition-transform duration-300"
                        aria-label="Delete resource"
                      >
                        <div className="bg-[#0f172a] p-2 rounded-full group-hover:bg-[#1e293b] transition-colors">
                          <Trash2
                            size={16}
                            className="text-gray-400 group-hover:text-blue-400 transition-colors"
                          />
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Upload Modal */}
      <UploadResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => mutate()}
      />

      <ResourcePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        resource={selectedResource}
      />
    </>
  );
}
