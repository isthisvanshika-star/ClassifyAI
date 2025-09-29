export default function DashboardHeader({ teacherName, onGenerateQrClick }: { teacherName: string; onGenerateQrClick: () => void; }) {
    const today = new Date();
    return (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold">
                    Welcome back, <span className="text-cyan-400">{teacherName}</span>
                </h1>
                <p className="text-gray-400 mt-2">
                    {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>
            <button 
                onClick={onGenerateQrClick}
                className="mt-4 md:mt-0 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h-1m-1 6v-1M4 12H3m15-1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Start Attendance
            </button>
        </header>
    );
}