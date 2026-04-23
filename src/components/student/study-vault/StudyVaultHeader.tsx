"use client";
import { BookOpen, Search } from "lucide-react";

export default function StudyVaultHeader({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
      <div className="ml-20">
        <h1 className="text-5xl h-15 font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent flex items-center gap-3">
          <BookOpen size={46} className="text-cyan-400" />
          Study Vault
        </h1>
        <p className="text-gray-400 mt-2">
          Smart learning powered by Open AI
        </p>
      </div>

      <div className="relative w-full md:w-80">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes, PYQs..."
          className="w-full bg-gradient-to-r from-white/5 to-white/10 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-gray-200 backdrop-blur-xl focus:ring-2 focus:ring-cyan-400 outline-none"
        />
      </div>
    </div>
  );
}