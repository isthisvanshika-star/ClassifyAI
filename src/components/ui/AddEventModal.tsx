"use client";

import { Tektur } from "next/font/google";
import React, { useEffect, useState } from "react";
import { Event } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  showErrorMessage,
  showLoadingMessage,
  showSuccessMessage,
} from "@/lib/helper";

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const AddEventModal = ({
  isOpen,
  onClose,
  onSuccess,
  mode,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "add" | "edit";
  initialData?: Event | null;
}) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    type: "EXAM",
    active: true,
  });
  const [loading, setLoading] = useState(false);
  // 1. Add state to hold the campusId
  const [campusId, setCampusId] = useState("");
  const [createdBy, setCreatedBy] = useState("");

  useEffect(() => {
    // 2. Get campusId and the assistant's user ID from localStorage
    const assistantUserId = localStorage.getItem("assistantId") ?? "";
    const assistantCampusId = localStorage.getItem("CampusID") ?? "";
    setCreatedBy(assistantUserId);
    setCampusId(assistantCampusId);

    if (initialData) {
      setForm({
        title: initialData.title,
        description: initialData.description ?? "",
        // The API expects a full ISO string, but the date input needs YYYY-MM-DD
        date: new Date(initialData.date).toISOString().slice(0, 10),
        type: initialData.type,
        active: initialData.active ?? true,
      });
    } else {
      // Reset form for 'add' mode
      setForm({
        title: "",
        description: "",
        date: "",
        type: "EXAM",
        active: true,
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    showLoadingMessage(
      mode === "add" ? "Creating event..." : "Updating event..."
    );

    try {
      // 3. Add campusId to the API request payload for both 'add' and 'edit'
      let payload: any = {
        ...form,
        date: new Date(form.date).toISOString(), // Send the full ISO string
        campusId: campusId,
        createdBy: createdBy,
      };

      if (mode === "edit") {
        payload.eventId = initialData?.id;
        payload.active = form.active;
      }

      const res = await fetch(
        mode === "add"
          ? `/api/assistant/event/create`
          : `/api/assistant/event/edit`,
        {
          method: mode === "add" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${mode} event`);
      }

      showSuccessMessage(
        `Event ${mode === "add" ? "created" : "updated"} successfully!`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      showErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 flex justify-center items-center z-[9999]"
          onClick={onClose}
        >
          <motion.div
            key="modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="from-orange-800/50 via-orange-300/50 border-orange-400 border to-orange-800/50 bg-gradient-to-bl rounded-xl p-6 w-full max-w-md space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={`text-2xl ${tektur.className} text-orange-100`}>
              {mode === "add" ? "Add New Event" : "Edit Event"}
            </h2>

            <input
              name="title"
              placeholder="Title"
              className="w-full  rounded p-2  outline-none ring-1 ring-orange-200 focus:ring-2 transition-all duration-500 focus:ring-orange-400"
              value={form.title}
              autoComplete="off"
              onChange={handleChange}
            />
            <textarea
              name="description"
              placeholder="Description"
              className="w-full  rounded p-2  outline-none ring-1 ring-orange-200 focus:ring-2 transition-all duration-500 focus:ring-orange-400"
              value={form.description}
              autoComplete="off"
              onChange={handleChange}
            />

            <input
              name="date"
              type="date"
              autoComplete="off"
              className="w-full  rounded p-2  outline-none ring-1 ring-orange-200 focus:ring-2 transition-all duration-500 focus:ring-orange-400"
              value={form.date}
              onChange={handleChange}
            />

            <select
              name="type"
              className="w-full  rounded p-2  outline-none ring-1 ring-orange-200 focus:ring-2 transition-all duration-500 focus:ring-orange-400"
              value={form.type}
              onChange={handleChange}
            >
              <option value="EXAM" className="bg-amber-700">
                Exam
              </option>
              <option value="HOLIDAY" className="bg-amber-700">
                Holiday
              </option>
              <option value="EVENT" className="bg-amber-700">
                Event
              </option>
              <option value="OTHER" className="bg-amber-700">
                Other
              </option>
            </select>

            {mode === "edit" && (
              <select
                name="active"
                className="w-full bg-gray-700 rounded p-2 text-white outline-none ring-1 ring-transparent focus:ring-orange-400"
                value={form.active ? "true" : "false"}
                onChange={(e) =>
                  setForm({ ...form, active: e.target.value === "true" })
                }
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                className="px-4 py-2 rounded bg-gray-600 text-white font-semibold hover:bg-gray-500"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:bg-gray-400"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <span className="animate-pulse">
                    {mode === "add" ? "Adding…" : "Updating…"}
                  </span>
                ) : (
                  <span>{mode === "add" ? "Add Event" : "Update Event"}</span>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddEventModal;
