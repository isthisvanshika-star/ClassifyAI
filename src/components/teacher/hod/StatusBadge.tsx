"use client";
import React from "react";

const StatusBadge = ({ status }: { status: string }) => {
  const isPending = status === "PENDING";

  return (
    <span
      className={`text-xs px-2 py-1 rounded-full ${
        isPending ? "bg-red-500 text-white" : "bg-green-500 text-white"
      }`}
    >
      {isPending ? "Pending" : "Active"}
    </span>
  );
};

export default StatusBadge;
