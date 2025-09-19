"use client";

import React, { useEffect, useState } from "react";
import { Event, EventStats } from "@/lib/types";
import { Tektur } from "next/font/google";
import StatsRow from "@/components/admin/StatsRow";
import EventTable from "@/components/admin/EventTable";
import InsightsPanel from "@/components/admin/InsightsPanel";
import AddEventModal from "@/components/ui/AddEventModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { titleArrayForEventPage } from "@/lib/helper";
import { motion } from "framer-motion";

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const Page = () => {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    const res = await fetch(`/api/admin/event/all`);
    const data = await res.json();
    if (data.success) setEvents(data.events);
  };

  const fetchStats = async () => {
    const res = await fetch(`/api/admin/event/stats`);
    const data = await res.json();
    if (data.success) setStats(data.stats);
  };

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, []);

  const handleDelete = async () => {
    if (!selectedEvent) return;
    await fetch(`/api/admin/event/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: selectedEvent.id }),
    });
    setIsConfirmOpen(false);
    fetchEvents();
  };

  if (!stats)
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mt-52 uppercase animate-pulse text-2xl"
      >
        Loading…
      </motion.p>
    );

  return (
    <motion.div
      className="min-h-screen py-8 px-4 lg:px-10 space-y-10 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.h1
        className={`${tektur.className} text-center text-3xl text-orange-200`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        Manage Events
      </motion.h1>

      <div className="flex items-center justify-center">
        <StatsRow
          stats={{
            totalUsers: stats.totalEvents,
            premiumUsers: stats.exams,
            proUsers: stats.others,
            ultimateUsers: stats.holidays,
            expiredPremiums: 0,
          }}
          titleArray={titleArrayForEventPage}
          showExpiredCard={false}
        />
      </div>

      <motion.div
        className="mt-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.05,
            },
          },
        }}
      >
        <EventTable
          events={events}
          onEdit={(event) => {
            setSelectedEvent(event);
            setIsModalOpen(true);
          }}
          onDelete={(event) => {
            setSelectedEvent(event);
            setIsConfirmOpen(true);
          }}
        />
      </motion.div>

      <motion.section
        className="flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <InsightsPanel />
      </motion.section>
      <motion.button
        onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute z-10 px-5 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-orange-100 cursor-pointer shadow-lg
                   bottom-6 right-6
                   lg:top-8 lg:right-90 lg:bottom-auto"
      >
        <span className="hidden sm:inline">Add Event</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
      </motion.button>

      <AddEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchEvents()}
        initialData={selectedEvent}
        mode={selectedEvent ? "edit" : "add"}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </motion.div>
  );
};

export default Page;
