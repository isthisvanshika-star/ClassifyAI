"use client";

import { useState, useEffect } from "react";
import { Tektur } from "next/font/google";
import { motion } from "framer-motion";
import {
  showErrorMessage,
  showLoadingMessage,
  showSuccessMessage,
} from "@/lib/helper";

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function ManageLogsSection() {
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [loginLogs, setLoginLogs] = useState<number>(0);
  const [deleteCount, setDeleteCount] = useState<number>(0); // Default to a reasonable number
  const [type, setType] = useState<"all" | "login">("all");
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // 1. ADD STATE to store the campusId
  const [campusId, setCampusId] = useState<string | null>(null);

  useEffect(() => {
    // 2. GET the campusId from localStorage when the component mounts
    const id = localStorage.getItem("CampusID");
    setCampusId(id);
  }, []);

  // 3. This effect now depends on campusId to run
  useEffect(() => {
    // Don't run the fetch if we don't have a campusId yet
    if (!campusId) return;

    const fetchLogCounts = async () => {
      setInitialLoad(true);
      try {
        // 4. SEND the campusId with the API request
        const res = await fetch(
          `/api/assistant/settings/logs?campusId=${campusId}`
        );
        const data = await res.json();
        if (res.ok) {
          setTotalLogs(data.totalCount);
          setLoginLogs(data.loginCount);
        } else {
          throw new Error(data.error || "Failed to fetch log counts.");
        }
      } catch (err: any) {
        showErrorMessage(err.message);
      } finally {
        setInitialLoad(false);
      }
    };

    fetchLogCounts();
  }, [campusId]); // Re-fetch if campusId changes

  const handleDeleteLogs = async () => {
    if (deleteCount <= 0) {
      showErrorMessage("Please enter a positive number of logs to delete.");
      return;
    }
    // 5. Ensure we have the campusId before trying to delete
    if (!campusId) {
      showErrorMessage("Could not identify the campus. Please refresh.");
      return;
    }

    setLoading(true);
    showLoadingMessage(`Deleting ${deleteCount} ${type} logs...`);
    try {
      const res = await fetch("/api/assistant/settings/logs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        // 6. SEND the campusId in the request body
        body: JSON.stringify({ count: deleteCount, type, campusId }),
      });

      const data = await res.json();
      if (res.ok) {
        showSuccessMessage(`${data.deleted} logs deleted successfully.`);
        // Refresh counts after deletion
        if (type === "all") {
          setTotalLogs((prev) => prev - data.deleted);
          // A simple refresh is easier than complex state logic
          const loginRes = await fetch(
            `/api/assistant/settings/logs?campusId=${campusId}`
          );
          const loginData = await loginRes.json();
          setLoginLogs(loginData.loginCount);
        } else {
          setLoginLogs((prev) => prev - data.deleted);
          setTotalLogs((prev) => prev - data.deleted);
        }
        setDeleteCount(10);
      } else {
        throw new Error(data.error || "Failed to delete logs.");
      }
    } catch (err: any) {
      showErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // The rest of your UI and animations remain exactly the same
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-gradient-to-br from-white/10 to-black/20 backdrop-blur-md h-[75vh] flex flex-col items-center p-6 rounded-xl shadow-xl border border-white/10 w-full"
    >
              {/* Your existing UI for animated blobs and the header remains the same */}
        <div className="absolute inset-0 z-0 overflow-hidden rounded-xl">
        <div className="absolute -top-1/3 -left-1/3 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse"></div>

        {/* Orange blob - moves in a circular pattern */}
        <motion.div
          className="absolute w-80 h-80 animate-pulse bg-orange-500/20 rounded-full filter blur-2xl"
          animate={{
            x: ["100%", "0%", "-20%", "0%", "100%"],
            y: ["100%", "50%", "0%", "50%", "100%"],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Blue blob - smaller, faster movement */}
        <motion.div
          className="absolute w-40 h-40 animate-pulse bg-blue-500/10 rounded-full filter blur-xl"
          animate={{
            x: ["25%", "75%", "50%", "25%"],
            y: ["25%", "75%", "25%", "75%"],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        </div>

      <motion.h2
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`text-4xl font-bold mb-10 mt-10 text-orange-300 z-10 ${tektur.className}`}
      >
        Manage Activity Logs
      </motion.h2>

      {initialLoad ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-orange-400"></div>
        </div>
      ) : (
        <>
          <motion.div className="flex gap-10 z-10" /* ... */>
            <p className="text-white/80 text-lg">
              Total logs: <span className="font-semibold">{totalLogs}</span>
            </p>
            <p className="text-white/80 text-lg">
              Login logs: <span className="font-semibold">{loginLogs}</span>
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col items-center mt-24 justify-center gap-6 max-w-sm z-10" /* ... */
          >
            <motion.select
              value={type}
              onChange={(e) => setType(e.target.value as "all" | "login")}
              className="px-4 py-3 rounded bg-white/10 appearance-none w-[20rem] text-white placeholder:text-white/50 focus:outline-none"
            >
              <option value="all" className="text-white bg-neutral-700">
                All Logs
              </option>
              <option value="login" className="text-white bg-neutral-700">
                Only Login Logs
              </option>
            </motion.select>

            <motion.input
              type="number"
              placeholder="Number of logs to delete"
              min={1}
              value={deleteCount || ""}
              onChange={(e) => setDeleteCount(Number(e.target.value))}
              className="px-4 py-3 rounded bg-white/10 text-white w-[20rem] placeholder:text-white/50 focus:outline-none"
            />

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleDeleteLogs}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 w-[20rem] cursor-pointer transition rounded px-4 py-2 text-white font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {loading
                ? "Deleting…"
                : `Delete ${deleteCount} ${
                    type === "login" ? "Login" : ""
                  } Logs`}
            </motion.button>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
