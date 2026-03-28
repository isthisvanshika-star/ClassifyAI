import { Sparkles, Search, Check } from "lucide-react";

export default function AIAssistantSection({
  analysisResult,
  isAnalyzing,
  runAIAnalysis,
  getPlagiarismColor,
}: any) {
  return (
    <div className="bg-purple-950/20 p-5 rounded-2xl border border-purple-500/30 relative">
      <Sparkles className="absolute top-3 right-3 text-purple-400 opacity-60" />

      <div className="flex justify-between items-center mb-4 border-b border-purple-500/30 pb-3">
        <h4 className="font-bold text-white flex items-center gap-2">
          <Sparkles className="text-purple-400" /> Classify AI Assistant
        </h4>

        {!analysisResult ? (
          <button
            onClick={runAIAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 text-xs rounded-lg bg-purple-600 text-white flex items-center gap-1.5"
          >
            {isAnalyzing ? (
              <>
                <Search size={14} className="animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={14} /> Run Analysis
              </>
            )}
          </button>
        ) : (
          <span className="text-xs text-emerald-400 flex items-center gap-1.5">
            <Check size={14} /> Analysis Complete
          </span>
        )}
      </div>

      {analysisResult ? (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-2.5">
            {analysisResult.summary.map((point: string, index: number) => (
              <div key={index} className="text-sm text-gray-200">
                • {point}
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center">
            <div
              className={`text-4xl font-extrabold ${getPlagiarismColor(
                analysisResult.aiProbability,
              )}`}
            >
              {analysisResult.aiProbability}%
            </div>
            <div className="text-xs text-gray-400">AI Probability</div>
          </div>
        </div>
      ) : (
        <div className="text-center p-6 text-sm text-purple-300">
          Ready to analyze this submission?
        </div>
      )}
    </div>
  );
}
