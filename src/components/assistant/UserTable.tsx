"use client";

import { User } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Tektur } from "next/font/google";
import React, { useEffect, useState } from "react";
import { Loader2, Users } from "lucide-react";
import useSWR from "swr";

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const UserTable = () => {
  const [campusId, setCampusId] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");

  useEffect(() => {
    const CampusID = localStorage.getItem("CampusID");
    if (CampusID) {
      console.log("Here");
      setCampusId(CampusID);
    }
  }, []);
  const { data, isLoading, error } = useSWR<{ users: User[] }>(
    campusId ? `/api/assistant/users?role=${role}&campusId=${campusId}` : null,
    fetcher
  );

  const users = data?.users || [];

  return (
    <div className={`p-4 sm:p-6 md:p-8 text-white ${tektur.className}`}>
      {/* --- Toggle Switch --- */}
      <div className="flex gap-4 mb-6 items-center justify-center">
        <span
          className={role === "STUDENT" ? "text-orange-500" : "text-gray-400"}
        >
          Students
        </span>
        <motion.button
          layout
          onClick={() => setRole(role === "STUDENT" ? "TEACHER" : "STUDENT")}
          className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
            role === "TEACHER" ? "bg-orange-600" : "bg-gray-700"
          }`}
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow"
            animate={{ x: role === "TEACHER" ? 24 : 0 }}
          />
        </motion.button>
        <span
          className={role === "TEACHER" ? "text-orange-500" : "text-gray-400"}
        >
          Teachers
        </span>
      </div>

      {/* --- Data Display --- */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-orange-400">
          <Users />
          <p className="text-lg mt-2">No {role.toLowerCase()}s found.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <table className="w-full border-collapse overflow-scroll">
            <thead className="hidden lg:table-header-group">
              <tr className="bg-orange-900/80 text-orange-100">
                <th className="px-4 py-3 text-left rounded-l-lg">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Premium</th>
                <th className="px-4 py-3 text-left rounded-r-lg">Created At</th>
              </tr>
            </thead>
            <tbody className="flex flex-col gap-4 lg:table-row-group overflow-y-auto lg:gap-0">
              <AnimatePresence>
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="block p-4 rounded-lg bg-white/5 border border-orange-800/50 
                               lg:table-row lg:p-0 lg:border-b lg:border-orange-800/50 lg:hover:bg-orange-800/20"
                  >
                    <td
                      data-label="Name"
                      className="responsive-cell lg:px-4 lg:py-3"
                    >
                      {user.name}
                    </td>
                    <td
                      data-label="Email"
                      className="responsive-cell lg:px-4 lg:py-3 truncate"
                    >
                      {user.email}
                    </td>
                    <td
                      data-label="Premium"
                      className="responsive-cell lg:px-4 lg:py-3"
                    >
                      {(() => {
                        if (!user.isPremium || !user.premiumFeatures?.length)
                          return "Starter";
                        const premiumSet = new Set(
                          user.premiumFeatures.map((f) => f.name)
                        );
                        const allFeatures = [
                          "AI_CHATBOT",
                          "STUDY_PLAN",
                          "CALENDAR_SYNC",
                        ];
                        const hasAll = allFeatures.every((f) =>
                          premiumSet.has(f)
                        );
                        if (hasAll) return "Ultimate";
                        return "Pro";
                      })()}
                    </td>
                    <td
                      data-label="Created At"
                      className="responsive-cell lg:px-4 lg:py-3"
                    >
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {/* We need a tiny bit of CSS for the mobile card labels, as this can't be done in Tailwind alone. */}
          <style jsx global>{`
            @media (max-width: 1023px) {
              .responsive-cell {
                display: block;
                width: 100%;
                text-align: right;
                padding-left: 50%;
                position: relative;
                margin-bottom: 0.5rem;
              }
              .responsive-cell:before {
                content: attr(data-label);
                position: absolute;
                left: 0;
                width: 45%;
                text-align: left;
                font-weight: bold;
                color: #fdba74; /* text-orange-300 */
              }
              .responsive-cell:last-child {
                margin-bottom: 0;
              }
            }
          `}</style>
        </motion.div>
      )}
    </div>
  );
};

export default UserTable;
