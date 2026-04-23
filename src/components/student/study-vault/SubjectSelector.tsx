"use client";
import { Sparkles } from "lucide-react";

export default function SubjectSelector({
  resources,
  setSelectedSubject,
}: any) {
  const subjects = [
    ...new Map(resources.map((r: any) => [r.subject?.id, r.subject])).values(),
  ].filter(Boolean);

  return (
    <div className="text-center p-10 bg-gradient-to-br from-slate-900/50 to-slate-800/30 rounded-3xl border border-white/5">
      <Sparkles className="w-12 h-12 text-violet-400 mx-auto mb-4 animate-pulse" />

      <h3 className="text-xl font-bold text-gray-300 mb-2">
        Select a Subject
      </h3>

      <p className="text-gray-500 text-sm mb-6">
        Choose a subject to run AI predictions on its PYQs.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        {subjects.map((subject: any) => (
          <button
            key={subject.id}
            onClick={() =>
              setSelectedSubject({
                id: subject.id,
                name: subject.name,
              })
            }
            className="px-5 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 transition font-semibold text-sm"
          >
            {subject.name}
          </button>
        ))}
      </div>
    </div>
  );
}