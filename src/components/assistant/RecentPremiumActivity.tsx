"use client";

import { Activity } from "@/lib/types";
import { Tektur } from "next/font/google";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const RecentPremiumActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // 1. Get the campusId from localStorage.
        const campusId = localStorage.getItem("CampusID");
        if (!campusId) {
          throw new Error("Campus ID not found. Please log in again.");
        }

        // 2. Use the retrieved campusId in the API call.
        const res = await fetch(`/api/users/recent-activity?campusId=${campusId}`);
        const data = await res.json();
        
        if (data.success) {
          setActivities(data.activities);
        } else {
            throw new Error(data.message || "Failed to fetch activities.");
        }
      } catch (err: any) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []); // Empty dependency array ensures this runs once on mount

  function removeIdFromText(text: string): string {
    const parts = text.split(" ");
    parts.shift();
    return parts.join(" ").trim();
  }

  if (loading) {
    return <p className="text-center text-orange-300 animate-pulse">Loading Activity...</p>;
  }

  if (error) {
    return <p className="text-center text-red-400">{error}</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-orange-900/20 p-4 rounded-xl border w-full border-orange-400"
    >
      <h2
        className={`${tektur.className} text-xl text-orange-200 text-center mb-4`}
      >
        Recent Premium Activity
      </h2>

      {activities.length > 0 ? (
        <ul className="space-y-2 overflow-y-auto scrollbar-hide h-[10rem] text-orange-100">
          {activities.map((a, idx) => (
            <motion.li
              key={a.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-2 border border-orange-800/50 bg-orange-900/20 rounded-lg flex justify-between items-center"
            >
                <div>
                    <span className="text-sm font-semibold capitalize">{a.username} </span>
                    <span className="text-sm text-gray-300">{removeIdFromText(a.text)}</span>
                </div>
                <span className="text-orange-300 text-xs flex-shrink-0">({a.date})</span>
            </motion.li>
          ))}
        </ul>
      ) : (
        <div className="flex items-center justify-center h-[10rem]">
            <p className="text-sm text-orange-300/70 text-center">
                No recent premium activity.
            </p>
        </div>
      )}
    </motion.div>
  );
};

export default RecentPremiumActivity;