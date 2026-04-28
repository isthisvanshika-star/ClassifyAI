"use client";
import React from "react";

const ErrorState = ({ message }: { message: string }) => {
  return (
    <div className="text-center text-3xl text-red-400 py-10">
      {message || "An error occurred while loading data."}
    </div>
  );
};

export default ErrorState;
