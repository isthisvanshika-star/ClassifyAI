"use client";
import { HorizontalBarProps } from "@/lib/types";
import { ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import React from "react";

interface Props extends HorizontalBarProps {
  locked?: boolean;
}

const HorizontalBar: React.FC<Props> = ({
  title,
  content,
  linkRef,
  locked = false,
}) => {
  return (
    <div
      className={`relative group 2xl:my-5 flex sm:w-72 2xl:w-[30rem] 2xl:h-[8rem] lg:w-[20rem] md:w-[22rem] w-80 max-w-md mx-auto my-2 p-2 bg-gradient-to-tl from-white/20 to-black/20 border border-cyan-300 rounded-4xl shadow-lg ${
        locked ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <div className="flex w-80 flex-col items-start justify-between p-4 rounded-lg">
        <p className="text-amber-50 2xl:text-lg text-base">{title}</p>
        <span className="text-gray-100 2xl:text-base text-sm">{content}</span>
      </div>
      <div className="flex items-center justify-center w-16 h-full">
        {locked ? (
          <div className="h-6 w-6 text-cyan-500 flex items-center justify-center text-center border border-cyan-300 rounded-full">
            <Lock size={16} />
          </div>
        ) : (
          <Link
            href={linkRef}
            className="h-4 w-4 text-cyan-500 flex items-center justify-center text-center border border-cyan-300 rounded-full hover:bg-cyan-500/65 transition-colors duration-200 shadow-md"
          >
            <ChevronRight />
          </Link>
        )}
      </div>
      {locked && (
        <div className="absolute inset-0 rounded-4xl flex items-center justify-center">
          <div className="text-white text-sm bg-cyan-600 px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Premium Feature
          </div>
        </div>
      )}
    </div>
  );
};

export default HorizontalBar;
