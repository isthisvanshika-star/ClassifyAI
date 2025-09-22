"use client";

import { Expiration } from "@/lib/types";
import { Tektur } from "next/font/google";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const UpcomingExpirations = () => {
  const [expirations, setExpirations] = useState<Expiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpirations = async () => {
      try {
        // 1. Get the campusId from localStorage.
        const campusId = localStorage.getItem("CampusID");
        if (!campusId) {
          throw new Error("Campus ID not found.");
        }

        // 2. Use the retrieved campusId in the API call.
        const res = await fetch(`/api/users/expirations?campusId=${campusId}`);
        const data = await res.json();
        
        if (data.success) {
          // 3. FIX: Use 'data.users' to match the API response.
          setExpirations(data.users || []);
        } else {
          throw new Error(data.message || "Failed to fetch expirations.");
        }
      } catch (err: any) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpirations();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-orange-900/20 rounded-xl w-full h-full p-4 border border-orange-400 overflow-hidden"
    >
      <h2
        className={`${tektur.className} text-xl text-center mb-3 text-orange-200`}
      >
        Upcoming Expirations
      </h2>

      {loading ? (
        <p className="text-orange-300 text-center mt-4 animate-pulse">Loading…</p>
      ) : error ? (
        <p className="text-red-400 text-center mt-4">{error}</p>
      ) : expirations.length > 0 ? (
        <motion.ul
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className="space-y-1 text-orange-100 overflow-y-auto scrollbar-hide h-[calc(100%-2.5rem)] pr-1"
        >
          {expirations.map((user) => (
            <motion.li
              key={user.id}
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0 },
              }}
              className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-orange-900/30"
            >
              <span className="truncate" title={user.name}>{user.name}</span>
              <span className="text-orange-300 flex-shrink-0">{user.endDate}</span>
            </motion.li>
          ))}
        </motion.ul>
      ) : (
        <div className="flex items-center justify-center h-[calc(100%-2.5rem)]">
            <p className="text-orange-300/70 text-center text-sm">
                No upcoming expirations.
            </p>
        </div>
      )}
    </motion.div>
  );
};

export default UpcomingExpirations;