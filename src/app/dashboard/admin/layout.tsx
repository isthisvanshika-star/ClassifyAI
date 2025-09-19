"use client";

import styles from "../admin/admin.module.css";
import ProfileCard from "@/components/admin/ProfileCard";
import UpComingEvents from "@/components/admin/UpComingEvents";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Tektur } from "next/font/google";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Logo from "@/components/admin/Logo";
import RecentAttendancePage from "@/components/admin/RecentAttendance";

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState<"upcoming" | "recent" | null>(null);

  return (
    <div className={`relative min-h-screen w-full ${tektur.className} ${styles.scrollbarHide}`}>
      <div className="absolute inset-0 bg-black/90 z-0" />
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen w-full">
        {/* LEFT SIDEBAR */}
        <div className="w-full lg:w-64 lg:h-screen lg:flex-shrink-0 lg:border-r lg:border-neutral-800">
          <div className="flex overflow-hidden flex-row items-center justify-between p-4 lg:flex-col lg:justify-start lg:p-5">
            <Logo />
            <AdminSidebar />
          </div>
        </div>

        {/* CENTER CONTENT */}
        <div
          className={`${styles.scrollbarHide} w-full flex-1 lg:h-screen overflow-hidden sm:overflow-y-auto p-4 sm:p-6 md:p-8`}
        >
          {children}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-full lg:w-80 lg:h-screen lg:flex-shrink-0 overflow-y-auto lg:border-l lg:border-neutral-800">
          <div className="text-white p-4 h-full flex flex-col gap-4 overflow-hidden max-w-full">
            <div className="flex justify-center lg:justify-end mb-4">
              <ProfileCard />
            </div>
            <AnimatePresence mode="wait">
              {expanded !== "upcoming" && (
                <motion.div
                  key="recent"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    flexGrow: expanded === "recent" ? 10 : 1,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="overflow-hidden flex flex-col min-w-0"
                >
                  <div className="grid place-items-center max-w-full h-full overflow-hidden">
                    <h1 className={`${tektur.className} text-2xl mb-2`}>
                      Recent Attendance
                    </h1>
                    <div className="w-full max-w-full overflow-hidden">
                      <RecentAttendancePage expanded={expanded === "recent"} />
                    </div>
                    <button
                      onClick={() =>
                        setExpanded(expanded === "recent" ? null : "recent")
                      }
                      className={`mt-2 text-sm text-orange-400 flex items-center justify-center w-[80%] transition-all duration-300 ${
                        expanded === "recent"
                          ? "border-b-2 border-orange-700"
                          : "border-b border-orange-600"
                      }`}
                    >
                      {expanded === "recent" ? <ChevronUp /> : <ChevronDown />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {expanded !== "recent" && (
                <motion.div
                  key="upcoming"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    flexGrow: expanded === "upcoming" ? 10 : 1,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="overflow-hidden flex flex-col min-w-0"
                >
                  <div className="grid place-items-center max-w-full h-full overflow-hidden">
                    <h1
                      className={`${tektur.className} text-2xl mb-2 text-center`}
                    >
                      Upcoming Events
                    </h1>
                    <div className="w-full max-w-full overflow-hidden">
                      <UpComingEvents expanded={expanded === "upcoming"} />
                    </div>
                    <button
                      onClick={() =>
                        setExpanded(expanded === "upcoming" ? null : "upcoming")
                      }
                      className={`mt-2 text-sm text-orange-400 flex items-center justify-center w-[80%] transition-all duration-300 ${
                        expanded === "upcoming"
                          ? "border-b-2 border-orange-700"
                          : "border-b border-orange-600"
                      }`}
                    >
                      {expanded === "upcoming" ? (
                        <ChevronUp />
                      ) : (
                        <ChevronDown />
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
