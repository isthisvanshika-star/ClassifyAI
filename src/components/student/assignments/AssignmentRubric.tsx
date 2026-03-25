import { motion } from "framer-motion";
import { ClipboardCheck } from "lucide-react";

const AssignmentRubric = ({ rubric }: any) => {
  if (!rubric) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0f172a]/70 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full" />

      <div className="flex items-center gap-3 text-indigo-300 mb-5 border-b border-white/10 pb-3">
        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-400/20">
          <ClipboardCheck size={18} />
        </div>
        <h2 className="text-lg font-semibold">Grading Rubric</h2>
      </div>

      <div className="text-gray-300 space-y-3">
        {Array.isArray(rubric) ? (
          <ul className="space-y-2">
            {rubric.map((item: string, index: number) => (
              <li
                key={index}
                className="flex gap-3 items-start px-3 py-2 rounded-lg bg-white/5 border border-white/5 hover:border-indigo-400/20"
              >
                <span className="text-indigo-400 text-sm font-medium">
                  {index + 1}.
                </span>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm bg-white/5 p-3 rounded-lg">
            {rubric}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default AssignmentRubric;