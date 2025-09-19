"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import UserTable from "@/components/admin/UserTable";
import LinkCards from "@/components/admin/LinkCards";
import useSWR from "swr";

// --- FONT & LIBRARY PLACEHOLDERS ---
// Imports for Next.js and SWR are removed for a self-contained component.
const tektur = {
  className: "font-tektur", // Assumes 'font-tektur' is defined globally
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const ManageUsers = () => {
  // A dummy mutate function to replace the one from useSWR.
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const { mutate } = useSWR(`/api/admin/users?role=${role}`, fetcher);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
      className="h-full flex flex-col"
    >
      <motion.h1
        className={`text-3xl sm:text-4xl ${tektur.className} text-center text-orange-200 mt-5`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        Manage Users
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex-1 overflow-y-auto scrollbar-hide my-4"
      >
        <UserTable />
      </motion.div>

      <motion.div
        className="flex flex-col md:flex-row sm:flex-row gap-4 items-center justify-center flex-shrink-0"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 },
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <LinkCards forRole="student" onActionComplete={() => mutate()} />
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, x: 20 },
            visible: { opacity: 1, x: 0 },
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <LinkCards forRole="teacher" onActionComplete={() => mutate()} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ManageUsers;
