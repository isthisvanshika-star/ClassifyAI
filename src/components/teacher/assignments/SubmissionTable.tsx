"use client";
import { motion } from "framer-motion";
import { Clock, CheckCircle } from "lucide-react";

export default function SubmissionTable({ submissions, dueDate, totalMarks, onGrade }: any) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-white/5 overflow-hidden">
      <table className="w-full text-left text-white">
        <thead className="bg-white/5 text-xs uppercase text-gray-400">
          <tr>
            <th className="px-6 py-4">Student Name</th>
            <th className="px-6 py-4">Submitted At</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Grade</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {submissions.map((sub: any) => {
            const isLate = dueDate && new Date(sub.submittedAt) > new Date(dueDate);
            return (
              <tr key={sub.id} className="hover:bg-white/5 transition">
                <td className="px-6 py-4">{sub.student.user.name}</td>
                <td className="px-6 py-4 text-gray-400 text-sm">{new Date(sub.submittedAt).toLocaleString()}</td>
                <td className="px-6 py-4">
                   <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${isLate ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                    {isLate ? <Clock size={12}/> : <CheckCircle size={12}/>} {isLate ? "Late" : "On Time"}
                   </span>
                </td>
                <td className="px-6 py-4">{sub.grade !== null ? `${sub.grade} / ${totalMarks}` : "Not Graded"}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onGrade(sub)} className="bg-cyan-600 hover:bg-cyan-500 px-4 py-1 rounded-lg text-sm">Grade</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}