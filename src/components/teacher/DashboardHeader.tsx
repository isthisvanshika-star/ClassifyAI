import { useRouter } from "next/navigation";

export default function DashboardHeader({
  teacherName,
  teacherDesignation,
  teacherDepartment,
  onGenerateQrClick,
}: {
  teacherName: string;
  teacherDesignation: string;
  teacherDepartment: string;
  onGenerateQrClick: () => void;
}) {
  const router = useRouter();
  const today = new Date();
  const isHOD = teacherDesignation.toUpperCase() === "HOD";
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">
          Welcome back, <span className="text-cyan-400">{teacherName}</span>
        </h1>
        <div className="flex gap-3">
          <p className="text-gray-400 mt-2">
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-cyan-400 font-semibold mt-2">
            {teacherDesignation} - {teacherDepartment}
          </p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
        {isHOD && (
          <button
            onClick={() => {
              router.push("/dashboard/teacher/hod");
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            Go to HOD Center
          </button>
        )}

        <button
          onClick={onGenerateQrClick}
          className="mt-4 md:mt-0 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h-1m-1 6v-1M4 12H3m15-1a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Start Attendance
        </button>
      </div>
    </header>
  );
}
