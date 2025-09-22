"use client";

import React from "react";
import { Tektur } from "next/font/google";
import { Event } from "@/lib/types";
import { Pencil, Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const EventTable = ({
  events,
  onEdit,
  onDelete,
}: {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}) => {
  return (
        <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-5xl xl:max-w-7xl"
    >
      <table className="min-w-full text-sm text-left text-orange-100 border-collapse">
        <thead className="hidden lg:table-header-group">
          <tr className={`${tektur.className} bg-orange-900 text-orange-200`}>
            <th className="px-4 py-3 rounded-l-lg">Title</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 rounded-r-lg">Actions</th>
          </tr>
        </thead>
        <tbody className="flex flex-col gap-4 lg:table-row-group">
          <AnimatePresence>
            {events.map((event, idx) => (
              <motion.tr
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="block p-4 rounded-lg bg-white/5 border border-orange-800/50 
                           lg:table-row lg:p-0 lg:border-b lg:border-orange-800/50 lg:hover:bg-orange-800/20"
              >
                <td data-label="Title" className="responsive-cell font-semibold lg:px-4 lg:py-3">{event.title}</td>
                <td data-label="Date" className="responsive-cell lg:px-4 lg:py-3">{new Date(event.date).toLocaleDateString()}</td>
                <td data-label="Type" className="responsive-cell lg:px-4 lg:py-3">{event.type}</td>
                <td data-label="Status" className="responsive-cell lg:px-4 lg:py-3">
                  {event.active ? (
                    <span className="px-2 py-1 text-xs rounded bg-green-600/30 text-green-300">Active</span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded bg-red-600/30 text-red-300">Inactive</span>
                  )}
                </td>
                <td data-label="Actions" className="responsive-cell-actions lg:px-4 lg:py-3">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => onEdit(event)} className="p-1 rounded hover:cursor-pointer transition">
                    <Pencil />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => onDelete(event)} className="p-1 rounded hover:cursor-pointer transition">
                    <Trash />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
        {/* CSS-in-JS for mobile card layout */}
        <style jsx global>{`
            @media (max-width: 1023px) {
              .responsive-cell, .responsive-cell-actions {
                display: block;
                width: 100%;
                text-align: right;
                padding-left: 50%;
                position: relative;
                margin-bottom: 0.75rem;
              }
              .responsive-cell:before {
                content: attr(data-label);
                position: absolute;
                left: 0;
                width: 45%;
                text-align: left;
                font-weight: bold;
                color: #fDBA74; /* text-orange-300 */
              }
              .responsive-cell-actions {
                  display: flex;
                  justify-content: flex-end;
                  gap: 0.5rem;
                  margin-top: 0.5rem;
              }
              .responsive-cell-actions:before {
                   content: attr(data-label);
                   position: absolute;
                   left: 0;
                   width: 45%;
                   text-align: left;
                   font-weight: bold;
                   color: #fDBA74;
              }
            }
          `}</style>
    </motion.div>
  );
};

export default EventTable;
