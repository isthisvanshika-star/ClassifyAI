"use client";
import { AssignmentHeaderProps } from "@/lib/types";
import { motion } from "framer-motion";
import { Edit3, UploadCloud, X } from "lucide-react";
import Link from "next/link";

export default function AssignmentHeader({
  assignment,
  handleStatusChange,
  isStatusLoading,
  onEditClick,
}: AssignmentHeaderProps) {
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mb-10"
    >
      <Link
        href="/dashboard/teacher/assignments"
        className="text-sm text-cyan-400 hover:underline mb-4 inline-block"
      >
        &larr; Back to All Assignments
      </Link>

      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent h-[3rem]">
          {assignment.title}
        </h1>

        <div className="flex  items-end gap-2">
          <button
            onClick={onEditClick}
            className="p-[1px] flex items-center gap-2 bg-gradient-to-r hover:from-violet-500 hover:via-blue-500 hover:to-cyan-500  bg-transparent border border-cyan-500 hover:border-transparent text-white font-bold py-2 px-6 rounded-xl cursor-pointer shadow-lg disabled:opacity-50 transition-colors duration-500"
          >
            <Edit3 size={20}  />
            <span>Edit Assignment</span>
          </button>

          {assignment.status === "DRAFT" ? (
            <motion.div
              onClick={() =>
                !isStatusLoading && handleStatusChange("PUBLISHED")
              }
              className="p-[1px] flex items-center gap-2 bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500 text-white font-bold py-2 px-6 rounded-xl cursor-pointer shadow-lg disabled:opacity-50"
            >
              <UploadCloud size={18} />
              <span>Publish</span>
            </motion.div>
          ) : (
            <button
              onClick={() => handleStatusChange("DRAFT")}
              disabled={isStatusLoading || assignment.submissions.length > 0}
              className={`flex items-center gap-2 font-bold py-2 px-6 rounded-xl border transition-all ${
                assignment.submissions.length > 0
                  ? "border-white/5 text-gray-600 cursor-not-allowed"
                  : "border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 cursor-pointer"
              }`}
            >
              <X size={18} />
              <span>Revert to Draft</span>
            </button>
          )}
          {assignment.status === "PUBLISHED" &&
            assignment.submissions.length > 0 && (
              <p className="text-[10px] text-gray-500 italic leading-tight">
                Cannot revert: Submissions exist.
              </p>
            )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-3 text-gray-400 text-sm">
        <span className="px-3 py-1 rounded-full bg-white/10">
          {assignment.subject.name}
        </span>
        <span className="px-3 py-1 rounded-full bg-white/10">
          Due:{" "}
          {assignment.dueDate
            ? new Date(assignment.dueDate).toLocaleString()
            : "No due date"}
        </span>
        <span className="px-3 py-1 rounded-full bg-white/10">
          Max Marks: {assignment.totalMarks || "N/A"}
        </span>
      </div>
    </motion.header>
  );
}
