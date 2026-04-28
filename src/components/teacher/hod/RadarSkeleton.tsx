"use client";
import React from "react";

const RadarSkeleton = () => {
  return (
    <div className="grid md:grid-cols-2 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-white/10 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
};

export default RadarSkeleton;
