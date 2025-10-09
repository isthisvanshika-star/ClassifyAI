"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

export default function ActiveSessionTracker({
  durationInSeconds,
  onTimerEnd,
}: {
  durationInSeconds: number;
  onTimerEnd: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(durationInSeconds);
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  // Set flag in localStorage when component mounts
  useEffect(() => {
    localStorage.setItem("activeAttendanceSession", "true");

    return () => {
      // Remove flag when component unmounts
      localStorage.removeItem("activeAttendanceSession");
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimerEnd();
      localStorage.removeItem("activeAttendanceSession"); // Remove flag when timer ends
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onTimerEnd]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <>
      {/* Dialog View */}
      <AnimatePresence>
        {isDialogOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-gradient-to-br from-cyan-900/90 via-cyan-800/90 to-cyan-900/90 text-white p-6 rounded-2xl shadow-2xl w-[350px] text-center border border-cyan-400/30"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Close button */}
              <button
                onClick={() => setIsDialogOpen(false)}
                className="absolute top-3 right-3 text-gray-300 hover:text-white"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>

              <p className="font-semibold text-cyan-300 mb-2">
                Live Attendance Session
              </p>
              <p className="text-4xl font-mono font-bold">
                {String(minutes).padStart(2, "0")}:
                {String(seconds).padStart(2, "0")}
              </p>
              <p className="text-xs text-gray-400 mt-2">Time Remaining</p>
              <p className="text-xs text-cyan-100 mt-2">
                Do not Logout till timer ends.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Mini Timer */}
      <AnimatePresence>
        {!isDialogOpen && (
          <motion.div
            className="fixed bottom-6 right-6 bg-cyan-700 text-white px-4 py-2 rounded-lg shadow-lg cursor-pointer z-50"
            initial={{ scale: 0.6, opacity: 0, x: 50, y: 50 }}
            animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
            exit={{ scale: 0.6, opacity: 0, x: 50, y: 50 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsDialogOpen(true)} // Expand back to dialog on click
          >
            <p className="font-mono font-bold text-lg">
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
