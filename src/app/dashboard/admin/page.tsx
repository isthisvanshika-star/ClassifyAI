"use client";

import { useState } from "react";
import { Tektur } from "next/font/google";
import CreateAssistantDialog from "@/components/admin/CreateAssistantDialog";
import CampusList from "@/components/admin/CampusList";
import { mutate } from "swr";

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["600"],
});

export default function SuperAdminDashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleActionComplete = () => {
    mutate("/api/campus");
  };

  return (
    <>
      {/* Background Layer */}
      <main className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-800 to-neutral-950 bg-cover bg-center z-0" />

      {/* Content Layer */}
      <main className="relative min-h-screen p-6 md:p-10 text-white backdrop-blur-sm">
        {/* Header */}
        <header className="mb-12">
          <h1
            className={`text-4xl font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-500 bg-clip-text text-transparent drop-shadow-xl ${tektur.className}`}
          >
             Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-400">
            Manage colleges and platform-wide assistants
          </p>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Onboard College Section */}
          <section className="bg-white/5 border border-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
            <h2 className="text-2xl font-semibold mb-3 text-indigo-300">
              Onboard a New College
            </h2>
            <p className="text-gray-400 mb-5">
              Create the first administrator account for a new college. This
              account will be assigned the{" "}
              <span className="font-semibold text-cyan-400">'ASSISTANT'</span>{" "}
              role.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:from-indigo-600 hover:via-violet-600 hover:to-purple-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all"
            >
              + Create New Assistant
            </button>
          </section>

          {/* Manage Campuses Section */}
          <section className="bg-white/5 border border-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
            <h2 className="text-2xl font-semibold mb-3 text-indigo-300">
              Manage Campuses
            </h2>
            <p className="text-gray-400 mb-5">
              View, edit, or remove existing campuses linked to the platform.
            </p>
            <div className="bg-neutral-900/70 p-4 rounded-xl border border-gray-700/50">
              <CampusList />
            </div>
          </section>
        </div>
      </main>

      {/* Modal */}
      <CreateAssistantDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onActionComplete={handleActionComplete}
      />
    </>
  );
}
