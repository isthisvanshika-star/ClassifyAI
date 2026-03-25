import { motion } from "framer-motion";
import { questionCleaner } from "@/lib/helper";

const AssignmentQuestions = ({ assignment }: any) => {
  return (
    <div className="p-[1px] rounded-3xl bg-gradient-to-r from-cyan-500/40 w-3/4 to-blue-500/40">
      <div className="bg-[#020617]/80 backdrop-blur-xl rounded-3xl p-8">
        
        <h2 className="text-xl font-semibold text-cyan-300 mb-6 border-b border-white/10 pb-3">
          Assignment Questions
        </h2>

        {(() => {
          if (!assignment.description) {
            return (
              <p className="text-gray-400 italic">
                No description available.
              </p>
            );
          }

          try {
            const parsedData = JSON.parse(assignment.description);

            if (Array.isArray(parsedData)) {
              return (
                <ul className="space-y-5 whitespace-pre-wrap">
                  {parsedData.map((q: string, index: number) => (
                    <motion.li
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all"
                    >
                      <span className="text-cyan-400 font-semibold">
                        Q{index + 1}.
                      </span>{" "}
                      {questionCleaner(q)}
                    </motion.li>
                  ))}
                </ul>
              );
            }
          } catch {
            return (
              <p className="text-gray-300 whitespace-pre-wrap">
                {assignment.description}
              </p>
            );
          }
        })()}
      </div>
    </div>
  );
};

export default AssignmentQuestions;