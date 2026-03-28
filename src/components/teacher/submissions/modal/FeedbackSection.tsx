import { AlignLeft, Mic, PenLine } from "lucide-react";

export default function FeedbackSection({
  feedback,
  setFeedback,
  feedbackMode,
  setFeedbackMode,
  attachSignature,
  setAttachSignature,
  submission,
}: any) {
  return (
    <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
      <div className="flex justify-between items-center mb-4">
        <label className="text-sm font-semibold text-gray-300">
          Teacher's Feedback
        </label>

        <div className="flex bg-slate-900 rounded-lg p-1 border border-white/5">
          <button
            onClick={() => setFeedbackMode("text")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              feedbackMode === "text"
                ? "bg-cyan-500 text-black shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <AlignLeft size={14} /> Text
          </button>

          <button
            onClick={() => setFeedbackMode("audio")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              feedbackMode === "audio"
                ? "bg-cyan-500 text-black shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Mic size={14} /> Audio
          </button>
        </div>
      </div>

      {feedbackMode === "text" ? (
        <textarea
          placeholder="Write your feedback here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          className="w-full bg-slate-800/80 border border-white/10 p-3 rounded-xl 
          focus:ring-2 focus:ring-cyan-500 outline-none 
          placeholder-gray-600 text-sm resize-none"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-cyan-500/20 rounded-xl bg-slate-800/50">
          <button
            className="w-16 h-16 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center 
            hover:bg-cyan-500 hover:text-black transition-all 
            shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]"
          >
            <Mic size={28} />
          </button>

          <p className="mt-3 text-sm text-gray-300 font-medium">
            Click to start recording
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Audio grading coming soon
          </p>
        </div>
      )}

      {submission?.fileUrl && submission.fileUrl.endsWith(".pdf") && (
        <label className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-white/5 cursor-pointer hover:bg-slate-800/50 transition-colors">
          <input
            type="checkbox"
            checked={attachSignature}
            onChange={(e) => setAttachSignature(e.target.checked)}
            className="w-5 h-5 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-slate-800 cursor-pointer"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-200 flex items-center gap-2">
              <PenLine size={16} className="text-indigo-400" />
              Attach my Digital Signature
            </span>
            <span className="text-xs text-gray-500">
              Stamp your pre-saved signature on this PDF
            </span>
          </div>
        </label>
      )}
    </div>
  );
}
