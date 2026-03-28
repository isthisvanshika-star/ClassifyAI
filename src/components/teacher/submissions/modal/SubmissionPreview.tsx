import { FileText, ExternalLink } from "lucide-react";

export default function SubmissionPreview({ submission, openInBrowser }: any) {
  const isPDF = submission?.fileUrl?.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-3">
      {submission?.fileUrl && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
            <FileText size={16} className="text-cyan-400" />
            Submitted Document
          </div>
          <button
            onClick={(e) => openInBrowser(e, submission.fileUrl)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 
            hover:border-cyan-400/40 hover:bg-white/10 
            text-cyan-300 transition-all"
          >
            <ExternalLink size={16} />
          </button>
        </div>
      )}
      {submission?.fileUrl && isPDF && (
        <div className="w-full h-[650px] rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50 shadow-inner">
          <iframe src={submission.fileUrl} className="w-full h-full" />
        </div>
      )}
      {submission?.fileUrl && !isPDF && (
        <button
          onClick={(e) => openInBrowser(e, submission.fileUrl)}
          className="w-full flex items-center justify-center gap-2 
          bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-white/10 
          p-4 rounded-xl text-cyan-300 font-medium transition-all duration-300"
        >
          <FileText size={18} className="text-cyan-400" />
          View Submitted Document
          <ExternalLink size={16} />
        </button>
      )}
      {submission?.text && (
        <div className="bg-slate-800/50 p-4 rounded-xl border h-[33rem] border-white/5">
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">
            Written Answer
          </p>
          <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed max-h-[470px] overflow-y-auto custom-scrollbar">
            {submission.text}
          </p>
        </div>
      )}
    </div>
  );
}
