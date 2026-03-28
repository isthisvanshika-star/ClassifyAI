import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function GradeModalHeader({ submission, isLate }: any) {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h2 className="text-2xl font-bold text-cyan-400 mb-1">
          Grade Submission
        </h2>
        <p className="text-gray-400 text-sm">
          Student:{" "}
          <span className="text-white font-medium">
            {submission?.student?.user?.name}
          </span>
        </p>
      </div>

      {isLate ? (
        <span className="flex items-center justify-evenly  h-11 uppercase w-25 bg-red-500/10 text-red-400 text-base px-3 py-1.5 rounded-full border border-red-500/20">
          <AlertCircle size={20} /> Late
        </span>
      ) : (
        <span className="flex items-center justify-evenly  h-11 uppercase w-32 bg-emerald-500/10 text-emerald-400 text-base px-3 py-1.5 rounded-full border border-emerald-500/20">
          <CheckCircle2 size={20} /> On Time
        </span>
      )}
    </div>
  );
}
