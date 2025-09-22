"use client";

import { motion } from "framer-motion";
import { Tektur } from "next/font/google";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import {
  showErrorMessage,
  showLoadingMessage,
  showSuccessMessage,
} from "@/lib/helper";

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const PremiumHeader = ({
  totalPremiumStudents,
}: {
  totalPremiumStudents: number;
}) => {
  const [loading, setLoading] = useState(false);
  const handleSendReports = async () => {
    setLoading(true);
    showLoadingMessage("Sending reports...");

    // Always re-fetch from localStorage
    const campus = localStorage.getItem("CampusID");
    const assistant = localStorage.getItem("assistantId");

    console.log("Sending with IDs:", { campus, assistant });

    if (!campus || !assistant) {
      showErrorMessage(
        "Could not verify assistant identity. Please log in again."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/mail/send-monthly-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campusId: campus,
          adminId: assistant,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccessMessage(data.message || "Reports sent successfully.");
      } else {
        showErrorMessage(data.error || "Failed to send reports.");
      }
    } catch (err) {
      showErrorMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full px-6 shadow flex flex-col gap-4 items-center relative"
    >
      <motion.h1
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className={`${tektur.className} text-4xl text-orange-200 text-center`}
      >
        Premium Management
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 items-center"
      >
        <span className="bg-amber-600 text-orange-50 px-3 py-1 rounded-full text-sm shadow">
          Total Premium Students: {totalPremiumStudents}
        </span>

        <button
          onClick={handleSendReports}
          disabled={loading}
          className="bg-orange-700 hover:bg-orange-600 cursor-pointer duration-500 text-white px-4 py-2 rounded-full text-sm shadow disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPaperPlane} />
          {loading ? "Sending…" : "Send Monthly Reports"}
        </button>
      </motion.div>
    </motion.header>
  );
};

export default PremiumHeader;
