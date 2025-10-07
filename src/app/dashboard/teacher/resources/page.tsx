"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { PlusCircle, File, Trash2 } from "lucide-react";
import UploadResourceModal from "@/components/teacher/UploadResourceModal";
import ResourcePreviewModal from "@/components/teacher/ResourcePreviewModal";
import {
  showErrorMessage,
  showLoadingMessage,
  showSuccessMessage,
  toastDissmisser,
} from "@/lib/helper";
import TConfirmModal from "@/components/ui/TConfirmModal";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ResourcesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [campusId, setCampusId] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setTeacherId(localStorage.getItem("teacherId"));
    setCampusId(localStorage.getItem("CampusID"));
  }, []);

  const { data, error, isLoading, mutate } = useSWR(
    teacherId && campusId
      ? `/api/teacher/resources?teacherId=${teacherId}&campusId=${campusId}`
      : null,
    fetcher
  );

  const handleDelete = async () => {
    if (!resourceToDelete || !teacherId) {
      showErrorMessage("An error occurred. Please refresh.");
      return;
    }

    setIsDeleting(true);
    const toastId = showLoadingMessage("Deleting resource...");
    try {
      const res = await fetch("/api/teacher/resources", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId: resourceToDelete.id,
          teacherId: teacherId,
        }),
      });

      const data = await res.json();
      toastDissmisser(toastId);
      if (!res.ok) throw new Error(data.error || "Failed to delete.");

      showSuccessMessage("Resource deleted successfully.");
      mutate();
      setResourceToDelete(null);
    } catch (err: any) {
      toastDissmisser(toastId);
      showErrorMessage(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

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
                            {resource.subject?.name || "Unknown Subject"}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-300 mt-4 line-clamp-3">
                        {resource.description || "No description provided."}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center">
                      <button
                        onClick={() => {
                          console.log({ resource });
                          setSelectedResource(resource);
                          setIsPreviewOpen(true);
                        }}
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setResourceToDelete(resource);
                        }}
                        className="cursor-pointer relative group p-[2px] rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 hover:scale-110 transition-transform duration-300"
                        aria-label="Delete announcement"
                      >
                        <div className="rounded-full bg-[#0f172a]/90 p-2 group-hover:bg-[#1e293b]/90 backdrop-blur-md transition-colors duration-300">
                          <Trash2
                            size={18}
                            className="text-rose-400 group-hover:text-white transition-colors duration-300 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]"
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

      <UploadResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => mutate()}
      />

      <ResourcePreviewModal
        isOpen={isPreviewOpen && selectedResource !== null}
        onClose={() => setIsPreviewOpen(false)}
        resource={selectedResource}
      />
      <TConfirmModal
        isOpen={!!resourceToDelete}
        onClose={() => setResourceToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Resource"
        message={`Are you sure you want to permanently delete "${resourceToDelete?.title}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </>
  );
}
