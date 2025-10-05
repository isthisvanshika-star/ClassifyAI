// 🔹 ClassifyAI Skeleton Loader (Layout-based)
export const AttendanceHistoryLoadingSkeleton = () => (
  <div className="animate-pulse">
    {/* Header */}
    <div className="mb-10 text-center">
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
