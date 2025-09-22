"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import React from "react";
import { Tektur } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faCalendarDays,
  faCrown,
  faGear,
  faArrowRightFromBracket,
  faChartSimple,
} from "@fortawesome/free-solid-svg-icons";

// --- FONT SETUP ---
const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// --- NAVIGATION LINKS ---
const links = [
  { href: "/dashboard/assistant", icon: faChartSimple, label: "Dashboard" },
  { href: "/dashboard/assistant/users", icon: faUsers, label: "Manage Users" },
  { href: "/dashboard/assistant/events", icon: faCalendarDays, label: "Events" },
  { href: "/dashboard/assistant/premium", icon: faCrown, label: "Premium" },
  { href: "/dashboard/assistant/settings", icon: faGear, label: "Settings" },
  {
    href: "/dashboard/assistant/logout",
    icon: faArrowRightFromBracket,
    label: "Logout",
  },
];

const AssistantSidebar = () => {
  const [pathname, setPathname] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className={`bg-gradient-to-t from-orange-900 via-gray-900 to-black text-gray-300
                    flex flex-row items-center justify-around p-2 rounded-xl
                    lg:flex-col lg:justify-start lg:w-48 lg:min-h-[42vw] lg:gap-40 lg:rounded-full lg:p-4
                    ${tektur.className}`}
    >
      <motion.h1
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`hidden lg:text-center lg:block text-2xl font-bold text-orange-600 mb-4 capitalize lg:mt-20 ${tektur.className}`}
      >
        Assistant panel
      </motion.h1>

      <nav className="flex flex-row items-center justify-center gap-2 lg:flex-col lg:gap-4 relative">
        {links.map((link) => (
          <div
            key={link.href}
            className="relative"
            onMouseEnter={() => setHovered(link.label)}
            onMouseLeave={() => setHovered(null)}
          >
            <a
              href={link.href}
              className={`p-3 rounded flex items-center justify-center text-3xl transition-colors duration-200 ${
                pathname === link.href
                  ? "text-orange-500"
                  : "text-gray-400 hover:text-orange-500/80"
              }`}
            >
              <FontAwesomeIcon icon={link.icon} />
            </a>

            <AnimatePresence>
              {hovered === link.label && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute z-20 w-max rounded-lg bg-black px-4 py-2 text-sm text-orange-100 shadow-lg
                        bottom-full left-1/2 mb-2 -translate-x-1/2
                        lg:left-full lg:top-1/2 lg:bottom-auto lg:ml-3 lg:-translate-x-0 lg:-translate-y-1/2
                    `}
                >
                  {link.label}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>
    </motion.aside>
  );
};
export default AssistantSidebar;
