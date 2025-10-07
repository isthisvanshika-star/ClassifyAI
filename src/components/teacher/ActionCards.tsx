"use client";

import { Subject, ClassSession } from "@/lib/types";
import {
  BookOpen,
  Megaphone,
  Upload,
  ClipboardCheck,
  Calendar,
  BarChartBig,
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.12, duration: 0.1, ease: [0.42, 0, 0.58, 1] }, // cubic-bezier for easeOut
  }),
};

export function QuickActionsCard() {
  const actions = [
    {
      label: "Assignments Analytics",
      icon: <BarChartBig size={22} />,
      color: "from-indigo-500 via-purple-500 to-pink-500",
      href: "/dashboard/teacher/analytics",
    },
    {
      label: "New Announcement",
      icon: <Megaphone size={22} />,
      color: "from-pink-500 via-red-500 to-orange-500",
      href: "/dashboard/teacher/announcements",
    },
    {
      label: "Upload Resources",
      icon: <Upload size={22} />,
      color: "from-green-400 via-emerald-500 to-teal-500",
      href: "/dashboard/teacher/resources",
    },
    {
      label: "Attendance Analytics",
      icon: <ClipboardCheck size={22} />,
      color: "from-yellow-400 via-orange-500 to-red-500",
      href: "/dashboard/teacher/analytics/attendance",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-black/20  border-gray-700 border p-6 rounded-2xl shadow-2xl"
    >
      <h2 className="text-xl font-bold mb-5 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((a, i) => (
          <Link key={i} href={a.href} className="block">
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className={`p-5 rounded-xl cursor-pointer text-white 
              bg-gradient-to-br ${a.color} shadow-lg hover:shadow-[0_0_20px] hover:shadow-cyan-500/50 
              flex flex-col items-center justify-center gap-2 transition-all`}
            >
              {a.icon}
              <span className="text-sm font-medium">{a.label}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

export function SubjectsCard({ subjects }: { subjects: Subject[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-black/20  border border-gray-700 p-6 rounded-2xl shadow-xl"
    >
      <h2 className="text-xl font-bold mb-5 text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text">
        Your Subjects
      </h2>
      {subjects.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {subjects.map((sub, i) => (
            <motion.div
              key={sub.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.05 }}
              className="p-4 rounded-lg bg-gray-800/70 border border-gray-700 hover:border-emerald-500 hover:shadow-[0_0_15px] hover:shadow-emerald-500/40 transition-all"
            >
              <p className="font-semibold text-white">{sub.name}</p>
              {sub.code && <p className="text-xs text-gray-400">{sub.code}</p>}
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No subjects assigned.</p>
      )}
    </motion.div>
  );
}

export function ScheduleCard({ classes }: { classes: ClassSession[] }) {
  return (
    <motion.div className="bg-black/20 border border-gray-700 p-6 rounded-2xl shadow-xl 2xl:h-[38.5vh]">
      <h2 className="text-xl font-bold mb-5 flex items-center gap-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        <Calendar size={20} className="text-purple-400" /> Today's Schedule
      </h2>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {classes.length > 0 ? (
          classes.map((cls, i) => (
            <motion.div
              key={cls.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="p-4 rounded-lg bg-gray-800/70 border-l-1 hover:border-l-4 cursor-pointer border-pink-500 hover:bg-gray-800/90  transition-all"
            >
              <p className="font-semibold text-white">{cls.subject.name}</p>
              <p className="text-sm text-gray-300">
                {`${cls.section.includes("Section") ? "" : "Section "} ${
                  cls.section
                }`}{" "}
                • Sem {cls.semester}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(cls.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {new Date(cls.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </motion.div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-10">No classes today.</p>
        )}
      </div>
    </motion.div>
  );
}

export function AttendanceSession({
  attendanceSessions,
}: {
  attendanceSessions: ClassSession[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-black/20 border border-gray-700 p-6 rounded-2xl shadow-xl 2xl:mt-5"
    >
      <h2 className="text-xl font-bold mb-5 text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text">
        Attendance Sessions
      </h2>
      {attendanceSessions.length > 0 ? (
        <div className="grid 2xl:grid-cols-5 gap-4">
          {attendanceSessions.map((as, i) => (
            <motion.div
              key={as.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.05 }}
              className="p-4 rounded-lg bg-gray-800/70 border-l-4 border-cyan-500 hover:bg-gray-800/90 hover:shadow-[0_0_20px] hover:shadow-cyan-500/40 transition-all"
            >
              <p className="font-semibold text-white">{as.subject.name}</p>
              <p className="text-sm text-gray-300">
                {`${as.section.includes("Section") ? "" : "Section "} ${
                  as.section
                }`}{" "}
                • Sem {as.semester}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(as.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {new Date(as.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-10">
          No attendance sessions today.
        </p>
      )}
    </motion.div>
  );
}
