export default function DashboardSkeleton() {
    return (
        <div className="min-h-screen overflow-hidden bg-gray-950/30 text-white p-4 md:p-8 animate-pulse">
            <header className="flex flex-col md:flex-row justify-between items-center mb-10">
                <div>
                    <div className="h-10 bg-gray-700 rounded w-64 mb-4"></div>
                    <div className="h-6 bg-gray-700 rounded w-80"></div>
                </div>
                <div className="h-12 bg-gray-700 rounded-lg w-48 mt-4 md:mt-0"></div>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-gray-800 p-6 rounded-xl h-40"></div>
                    <div className="bg-gray-800 p-6 rounded-xl h-56"></div>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl h-[450px]"></div>
            </div>
            <div className="mt-2">
                <div className="h-32 bg-gray-800 rounded-xl w-96 mb-4"></div>
            </div>
        </div>
    );
}