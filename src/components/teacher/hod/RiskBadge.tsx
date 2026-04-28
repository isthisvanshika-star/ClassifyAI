"use client";
import React from "react";

const RiskBadge = ({ value }: { value: number }) => {
  let color = "bg-green-500";
  let text = "Safe";

  if (value < 50) {
    color = "bg-red-500";
    text = "Critical";
  } else if (value < 75) {
    color = "bg-yellow-400";
    text = "Warning";
  }

  return (
    <span className={`text-xs px-2 py-1 rounded-full text-white ${color}`}>
      {text}
    </span>
  );
};

export default RiskBadge;
