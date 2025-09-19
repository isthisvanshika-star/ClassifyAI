"use client";

import { EventItem } from "@/lib/types";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tektur } from "next/font/google";

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const UpComingEvents = ({ expanded }: { expanded: boolean }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/admin/event`);
        const data = await res.json();
        if (data.success) {
          setEvents(data.events);
        }
      } catch {
        console.log("Error fetching events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <p className="text-gray-400 text-sm animate-pulse text-center">
          Loading upcoming events…
        </p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <p className="text-gray-400 text-sm text-center">
          No upcoming events found.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      layout
      transition={{ duration: 0.5 }}
      className="overflow-y-auto outline-none w-full scrollbar-hide px-2 sm:px-4"
      style={{
        maxHeight: expanded ? "30rem" : "12rem",
      }}
    >
      <ul className="space-y-3 outline-none">
        {events.map((event) => (
          <li
            key={event.id}
            className="flex justify-between items-center gap-4 p-3 hover:cursor-pointer hover:shadow transition-all duration-700 hover:shadow-amber-600 rounded bg-white/5 text-gray-200"
          >
            <article className="flex flex-1 flex-col min-w-0">
              <h3
                className={`font-medium text-orange-100 truncate text-sm lg:text-base ${tektur.className}`}
                title={event.title}
              >
                {event.title}
              </h3>
              <p
                className="text-xs text-gray-400 truncate"
                title={event.description}
              >
                {event.description}
              </p>
            </article>
            <time
              dateTime={new Date(event.date).toISOString()}
              className="text-orange-500 text-xs sm:text-sm flex-shrink-0"
            >
              {new Date(event.date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
              })}
            </time>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default UpComingEvents;
