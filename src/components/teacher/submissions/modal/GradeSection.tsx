import { Hash, SlidersHorizontal } from "lucide-react";

export default function GradeSection({
  grade,
  setGrade,
  gradeMode,
  setGradeMode,
  rubric,
  setRubric,
  totalMarks,
}: any) {
  return (
    <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
      <div className="flex justify-between items-center mb-4">
        <label className="text-sm font-semibold text-gray-300">
          Marks Awarded
        </label>

        <div className="flex bg-slate-900 rounded-lg p-1 border border-white/5">
          <button
            onClick={() => setGradeMode("manual")}
            className={`px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-all ${
              gradeMode === "manual"
                ? "bg-cyan-500 text-black shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Hash size={14} /> Manual
          </button>

          <button
            onClick={() => setGradeMode("rubric")}
            className={`px-3 py-1.5 rounded-md text-xs flex items-center gap-1.5 transition-all ${
              gradeMode === "rubric"
                ? "bg-cyan-500 text-black shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <SlidersHorizontal size={14} /> Rubric
          </button>
        </div>
      </div>

      {gradeMode === "manual" ? (
        <input
          type="number"
          placeholder={`Total out of ${totalMarks || 100}`}
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="w-full bg-slate-800/80 border border-white/10 p-3 rounded-xl 
          focus:ring-2 focus:ring-cyan-500 outline-none 
          placeholder-gray-600 text-white"
        />
      ) : (
        <div className="space-y-4">
          {["concept", "execution", "formatting"].map((key) => (
            <input
              key={key}
              type="range"
              min="0"
              max="40"
              value={rubric[key]}
              onChange={(e) =>
                setRubric({
                  ...rubric,
                  [key]: parseInt(e.target.value),
                })
              }
              className="w-full accent-cyan-500"
            />
          ))}

          <div className="pt-2 border-t border-white/10 text-right font-bold text-cyan-400">
            Total: {grade || 0} / {totalMarks || 100}
          </div>
        </div>
      )}
    </div>
  );
}
