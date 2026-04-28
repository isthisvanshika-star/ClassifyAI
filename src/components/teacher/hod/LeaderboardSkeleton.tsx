"use client";
import React from "react";

const LeaderboardSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="h-64 bg-white/10 rounded-2xl animate-pulse" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-white/10 rounded-xl animate-pulse" />
      ))}
    </div>
  );
};

export default LeaderboardSkeleton;
