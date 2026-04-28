export default function DashboardSkeleton() {
  return (
    <div className="w-full h-full text-white p-4 md:p-6 animate-pulse space-y-6">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-3">
          <div className="h-8 bg-gray-700/50 rounded w-56"></div>
          <div className="h-5 bg-gray-700/40 rounded w-72"></div>
        </div>
        <div className="h-10 bg-gray-700/50 rounded-lg w-40"></div>
      </header>

      {/* Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800/50 p-4 rounded-xl h-32"></div>
          <div className="bg-gray-800/50 p-4 rounded-xl h-48"></div>
        </div>

        {/* Right */}
        <div className="bg-gray-800/50 p-4 rounded-xl h-48 lg:h-full"></div>
      </div>

      {/* Bottom */}
      <div className="space-y-4">
        <div className="h-24 bg-gray-800/50 rounded-xl w-full md:w-80"></div>
      </div>

    </div>
  );
}