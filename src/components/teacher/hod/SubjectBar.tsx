"use client";
import React from "react";

const SubjectBar = ({ sub }: { sub: any }) => {
  return (
    <div>
      <div className="flex justify-between text-xs text-white/70 mb-1">
        <span>
          {sub.subjectName} ({sub.subjectCode})
        </span>
        <span>{sub.percentage}%</span>
      </div>

      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${
            sub.percentage < 50
              ? "bg-red-500"
              : sub.percentage < 75
                ? "bg-yellow-400"
                : "bg-green-400"
          }`}
          style={{ width: `${sub.percentage}%` }}
        />
      </div>
    </div>
  );
};

export default SubjectBar;
