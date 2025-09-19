"use client";

import PremiumHeader from "@/components/admin/PremiumHeader";
import PremiumUsersTable from "@/components/admin/PremiumUsersTable";
import RecentPremiumActivity from "@/components/admin/RecentPremiumActivity";
import SearchFilterBar from "@/components/admin/SearchFilterBar";
import StatsRow from "@/components/admin/StatsRow";
import UpcomingExpirations from "@/components/admin/UpcomingExpiration";
import { PremiumUser, Stats } from "@/lib/types";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { titleArrayForPremiumPage } from "@/lib/helper";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Page = () => {
  const [totalPremiumUsers, setTotalPremiumUsers] = useState<number>(0);
  const [allUsers, setAllUsers] = useState<PremiumUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");

  const fetchPremiumCount = async () => {
    try {
      const res = await fetch(`/api/users/premium-count`);
      const data = await res.json();
      if (data.success) {
        setTotalPremiumUsers(data.totalPremiums);
      }
    } catch (err) {
      console.error("Failed to fetch premium count", err);
    }
  };

  const fetchStats = async () => {
    const res = await fetch(`/api/users/stats`);
    const data = await res.json();
    if (data.success) {
      setStats(data.stats);
    }
  };

  const fetchPremiumUsers = async () => {
    const res = await fetch(`/api/users/premium-count/all`);
    const data = await res.json();
    if (data.success) {
      setAllUsers(data.users);
    }
  };

  useEffect(() => {
    fetchPremiumUsers();
    fetchStats();
    fetchPremiumCount();
  }, []);

  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Pro" && user.plan === "PRO") ||
      (filter === "Ultimate" && user.plan === "ULTIMATE") ||
      (filter === "Expired" && user.status === "EXPIRED");

    return matchesSearch && matchesFilter;
  });

  if (!stats)
    return (
      <div className="text-center mt-52 animate-pulse text-2xl">
        Loading...
      </div>
    );

  return (
    <motion.div
      className="min-h-screen  px-4 lg:px-10 space-y-8 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PremiumHeader totalPremiumStudents={totalPremiumUsers} />
      <StatsRow stats={stats} titleArray={titleArrayForPremiumPage} />
      <SearchFilterBar onSearch={setSearchTerm} onFilter={setFilter} currentFilter={filter} />

      {/* --- 🚨 RESPONSIVE LAYOUT FOR TABLE & SIDE CARDS --- */}
      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        {/* Table takes up most space on desktop, full width on mobile */}
        <div className="w-full lg:w-2/3">
          <AnimatePresence mode="wait">
            <motion.div
              key={filter + searchTerm}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PremiumUsersTable users={filteredUsers} onRefresh={() => {}} />
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Side cards stack on mobile and on the right on desktop */}
        <div className="w-full lg:w-1/3 flex flex-col gap-8">
          <RecentPremiumActivity />
          <UpcomingExpirations />
        </div>
      </div>
    </motion.div>
  );
};

export default Page;
