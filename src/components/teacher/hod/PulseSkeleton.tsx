"use client";
import React from "react";

const PulseSkeleton = () => {
  return (
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-36 rounded-2xl bg-white/10 animate-pulse backdrop-blur-lg"
        />
      ))}
    </div>
  );
};

export default PulseSkeleton;
