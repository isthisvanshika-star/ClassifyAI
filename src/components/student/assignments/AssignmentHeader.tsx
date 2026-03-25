import { Award, BookOpen, CalendarDays } from "lucide-react";

const AssignmentHeader = ({ assignment }: any) => {
  return (
    <div className="relative p-[1px] rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500">
      <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl p-8">
        
        <div className="flex items-center gap-2 text-cyan-400 mb-3">
          <BookOpen size={18} />
          <span className="uppercase text-sm tracking-wider">
            {assignment.subject?.name || "Subject"}
          </span>
        </div>

        <h1 className="text-4xl h-[4rem] md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          {assignment.title}
        </h1>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <CalendarDays size={16} className="text-cyan-400" />
            <span
              className={
                new Date(assignment.dueDate) < new Date()
                  ? "text-red-400"
                  : "text-gray-300"
              }
            >
              {assignment.dueDate
                ? new Date(assignment.dueDate).toLocaleString()
                : "No Due Date"}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <Award size={16} className="text-yellow-400" />
            <span>
              {assignment.totalMarks
                ? `${assignment.totalMarks} Marks`
                : "Not Graded"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentHeader;