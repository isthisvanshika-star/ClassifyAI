"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Tektur } from "next/font/google";
import AttendanceGraph from "@/components/assistant/AttendanceGraph";
import RecentActivity from "@/components/assistant/RecentActivity";
import BottomStrip from "@/components/assistant/BottomStrip";
import styles from "./admin.module.css";

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function VerificationGatekeeper({
  status,
  onRedirect,
}: {
  status: "verifying" | "needs_setup" | "error";
  onRedirect: () => void;
}) {
  const messages = {
    verifying: {
      title: "Verifying Your Setup",
      text: "Please wait while we check your campus configuration...",
    },
    needs_setup: {
      title: "Setup Required",
      text: "Welcome! You must set up your campus before you can access the dashboard.",
    },
    error: {
      title: "Verification Failed",
      text: "We couldn't verify your account status. Please try again later.",
    },
  };

  const currentMessage = messages[status] || messages.error;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 flex justify-center items-center z-50 text-center p-4"
    >
      <div className="bg-orange-100 p-8 rounded-lg shadow-xl max-w-md border border-gray-700">
        <h2
          className={`text-2xl font-bold text-black mb-4 ${tektur.className}`}
        >
          {currentMessage.title}
        </h2>
        <p className="text-gray-700 mb-6">{currentMessage.text}</p>

        {status === "verifying" && (
          <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-indigo-400 mx-auto"></div>
        )}

        {status === "needs_setup" && (
          <button
            onClick={onRedirect}
            className={`bg-orange-600 hover:bg-orange-900 transition-all duration-500 cursor-pointer text-white font-bold py-2 px-6 rounded-lg ${tektur.className}`}
          >
            Setup Assistant
          </button>
        )}
        {status === "error" && (
          <p className="text-red-400 text-sm">
            Please refresh the page or contact support.
          </p>
        )}
      </div>
    </motion.div>
  );
}

const DashboardContent = () => {
  const [summary, setSummary] = useState<{
    totalStudents: number;
    totalTeachers: number;
    totalAttendance: number;
    tokensToday: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const campusId = localStorage.getItem("CampusID");
        const res = await fetch(`/api/assistant/summary?campusId=${campusId}`);
        const data = await res.json();
        if (!data.error) {
          setSummary(data);
        }
      } catch (err) {
        console.error("Failed to fetch assistant summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading || !summary) {
    return (
      <div className="text-center mt-40">
        <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-indigo-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading dashboard data...</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Students",
      value: summary.totalStudents,
      color: "text-cyan-300",
    },
    {
      label: "Total Teachers",
      value: summary.totalTeachers,
      color: "text-green-300",
    },
    {
      label: "Attendance Today",
      value: summary.totalAttendance,
      color: "text-yellow-300",
    },
    {
      label: "Tokens Today",
      value: summary.tokensToday,
      color: "text-purple-300",
    },
  ];

  return (
    <div className={`${styles.scrollbarHide} text-white`}>
      <div
        className={`grid grid-cols-1 md:grid-cols-4 px-4 gap-4 mb-6 mt-16 ${tektur.className}`}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white/5 rounded-2xl p-4 text-center"
          >
            <h3 className={`${tektur.className} text-gray-400`}>
              {stat.label}
            </h3>
            <p
              className={`text-2xl font-bold ${tektur.className} ${stat.color}`}
            >
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-32 mb-6">
        <div className="md:col-span-2 bg-white/5 rounded-xl p-8 h-[25rem]">
          <AttendanceGraph />
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <RecentActivity />
        </div>
      </div>
      <div className="mt-28">
        <BottomStrip />
      </div>
    </div>
  );
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "needs_setup" | "complete" | "error"
  >("verifying");

  useEffect(() => {
    const assistantID = localStorage.getItem("assistantId");

    if (!assistantID) {
      router.replace("/auth/login");
      return;
    }

    const checkAssistantSetup = async () => {
      try {
        const response = await fetch(
          `/api/assistant/details?assistantId=${assistantID}`,
        );
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            router.replace("/auth/login");
            return;
          }
          throw new Error(data.error || "Failed to verify admin status.");
        }
        const isNotConfigured = !data?.campus?.logoUrl;
        if (!data?.campusId || isNotConfigured) {
          setVerificationStatus("needs_setup");
        } else {
          localStorage.setItem("CampusID", data.campusId);
          setVerificationStatus("complete");
        }
      } catch (err: any) {
        setVerificationStatus("error");
        console.error(err.message);
      }
    };

    checkAssistantSetup();
  }, [router]);

  return (
    <>
      {verificationStatus === "complete" && <DashboardContent />}

      <AnimatePresence>
        {verificationStatus !== "complete" && (
          <VerificationGatekeeper
            status={verificationStatus}
            onRedirect={() => router.push("/setup/assistant")}
          />
        )}
      </AnimatePresence>
    </>
  );
}
