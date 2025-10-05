import { motion } from "framer-motion";

// 🔹 ClassifyAI Skeleton Loader (Layout-based)
export const AttendanceHistoryLoadingSkeleton = () => (
  <div className="animate-pulse">
    {/* Header */}
    <div className="mb-10 text-start">
      <div className="h-8 w-64 mx-auto bg-gray-700/50 rounded-xl mb-4"></div>
      <div className="h-4 w-40 mx-auto bg-gray-700/40 rounded-lg"></div>
    </div>

    {/* Filters */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl border border-cyan-500/30 bg-gray-900/60 backdrop-blur-md shadow-lg shadow-cyan-500/10 mb-8">
      <div className="h-10 w-full bg-gray-700/50 rounded-lg"></div>
      <div className="h-10 w-full bg-gray-700/50 rounded-lg"></div>
      <div className="hidden lg:block h-10 w-full bg-gray-700/30 rounded-lg"></div>
      <div className="hidden lg:block h-10 w-full bg-gray-700/30 rounded-lg"></div>
    </div>

    {/* Table */}
    <div className="rounded-2xl border border-cyan-500/30 bg-gray-900/60 backdrop-blur-md shadow-lg shadow-cyan-500/10 overflow-hidden">
      {/* Table Head */}
      <div className="grid grid-cols-4 bg-gray-800/60 text-xs uppercase tracking-wider text-cyan-300">
        <div className="px-6 py-3">Student Name</div>
        <div className="px-6 py-3">Subject</div>
        <div className="px-6 py-3">Status</div>
        <div className="px-6 py-3">Date & Time</div>
      </div>

      {/* Table Rows (5 placeholders) */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-4 divide-x divide-gray-800 bg-gray-900/40"
        >
          <div className="px-6 py-4">
            <div className="h-4 w-32 bg-gray-700/40 rounded"></div>
          </div>
          <div className="px-6 py-4">
            <div className="h-4 w-24 bg-gray-700/40 rounded"></div>
          </div>
          <div className="px-6 py-4">
            <div className="h-5 w-16 bg-gray-700/40 rounded-full"></div>
          </div>
          <div className="px-6 py-4">
            <div className="h-4 w-28 bg-gray-700/40 rounded"></div>
          </div>
        </div>
      ))}

      {/* Pagination Skeleton */}
      <div className="flex justify-between items-center p-4 bg-gray-800/60 border-t border-cyan-500/20">
        <div className="h-8 w-24 bg-gray-700/50 rounded-lg"></div>
        <div className="h-4 w-32 bg-gray-700/40 rounded"></div>
        <div className="h-8 w-20 bg-gray-700/50 rounded-lg"></div>
      </div>
    </div>
  </div>
);

export const AttendanceHistoryTableLoadingSkeleton = () => (
  <div className="rounded-2xl border border-cyan-500/30 bg-gray-900/60 backdrop-blur-md shadow-lg shadow-cyan-500/10 mt-6 animate-pulse">
    <div className="h-48 w-full bg-gray-700/50 rounded-2xl"></div>
  </div>
);

export const ClassesLoadingSkeleton = () => (
  <div className="min-h-screen p-8 bg-transparent]">
    <div className="mb-10 space-y-4 max-w-6xl mx-auto">
      <div className="h-10 w-1/3 bg-white/10 rounded-lg animate-pulse"></div>
      <div className="h-4 w-1/2 bg-white/10 rounded-lg animate-pulse"></div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-lg animate-pulse space-y-4"
        >
          <div className="h-6 w-3/4 bg-white/20 rounded-lg"></div>
          <div className="h-4 w-1/2 bg-white/20 rounded-lg"></div>
          <div className="h-4 w-2/3 bg-white/20 rounded-lg"></div>
          <div className="h-10 w-full bg-white/20 rounded-lg mt-4"></div>
        </div>
      ))}
    </div>
  </div>
);

export const AnnouncementsLoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 animate-pulse"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.1 }}
      >
        <div className="h-4 w-1/3 bg-white/20 rounded mb-3" />
        <div className="h-3 w-1/4 bg-white/10 rounded mb-5" />
        <div className="h-3 w-full bg-white/10 rounded mb-2" />
        <div className="h-3 w-5/6 bg-white/10 rounded" />
      </motion.div>
    ))}
  </div>
);
