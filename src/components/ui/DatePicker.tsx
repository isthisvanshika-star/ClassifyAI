"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function DatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (date: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );

  const [currentMonth, setCurrentMonth] = useState<Date>(
    selectedDate || new Date()
  );

  const handleSelect = (date: Date) => {
    setSelectedDate(date);
    onChange(date.toISOString().split("T")[0]);
    setOpen(false);
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  return (
    <div className="relative z-50">
      {/* Input / Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-gray-800/80 border border-cyan-500/30 text-white hover:border-cyan-400 transition"
      >
        <span>{selectedDate ? format(selectedDate, "dd MMM yyyy") : "Select Date"}</span>
        <Calendar className="w-4 h-4 text-cyan-400" />
      </button>

      {/* Calendar Popup */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-[1000]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gray-900/90 border border-cyan-500/30 rounded-xl p-4 shadow-xl shadow-cyan-500/20 backdrop-blur-md"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header with Month Navigation */}
                <div className="flex justify-between items-center mb-3">
                  <motion.button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                      )
                    }
                    className="p-1 rounded"
                    whileHover={{ scale: 1.2 }}
                  >
                    <ChevronLeft className="w-4 h-4 text-cyan-400" />
                  </motion.button>
                  <span className="text-cyan-300 font-semibold">
                    {format(currentMonth, "MMMM yyyy")}
                  </span>
                  <motion.button
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                      )
                    }
                    className="p-1 rounded"
                    whileHover={{ scale: 1.2 }}
                  >
                    <ChevronRight className="w-4 h-4 text-cyan-400" />
                  </motion.button>
                </div>

                {/* Weekdays */}
                <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <span key={d} className="text-cyan-400">{d}</span>
                  ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                  {daysInMonth.map((day) => {
                    const isSelected =
                      selectedDate &&
                      selectedDate.toDateString() === day.toDateString();
                    return (
                      <motion.button
                        key={day.toISOString()}
                        onClick={() => handleSelect(day)}
                        className={`p-2 rounded-lg ${
                          isSelected
                            ? "bg-cyan-600 text-white"
                            : "text-gray-300"
                        }`}
                        whileHover={{
                          scale: 1.1,
                          backgroundColor: isSelected
                            ? "rgba(16, 185, 129, 1)"
                            : "rgba(16, 185, 129, 0.1)",
                        }}
                        transition={{ duration: 0.15 }}
                      >
                        {format(day, "d")}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
