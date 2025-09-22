"use client";

import { SupportRequest } from "@/lib/types";
import { Tektur } from "next/font/google";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { showErrorMessage, showLoadingMessage, showSuccessMessage } from "@/lib/helper";

const tektur = Tektur({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ContactRequestsSection = () => {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selected, setSelected] = useState<SupportRequest | null>(null);
  
  // 1. ADD STATE to store the campusId
  const [campusId, setCampusId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("CampusID");
    setCampusId(id);
  }, []);
  useEffect(() => {
    if (!campusId) return;

    const fetchRequests = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/assistant/settings/contact-requests?campusId=${campusId}`);
        const data = await res.json();
        if (res.ok) {
          setRequests(data.requests);
        } else {
          throw new Error(data.error || "Failed to fetch requests.");
        }
      } catch (err: any) {
        showErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [campusId]);

  const handleDelete = async (id: string) => {
    if (!campusId) {
        showErrorMessage("Could not verify campus. Please refresh.");
        return;
    }
    showLoadingMessage("Deleting request...");
    try {
      const res = await fetch(`/api/assistant/settings/contact-requests`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, campusId: campusId }),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccessMessage("Request deleted.");
        setRequests((prev) => prev.filter((r) => r.id !== id));
        setSelected(null);
      } else {
        throw new Error(data.error || "Failed to delete request.");
      }
    } catch (err: any) {
        showErrorMessage(err.message);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="
        relative z-0 
        bg-gradient-to-br from-white/10 to-black/20 backdrop-blur-md 
        h-[75vh] flex flex-col items-center p-6 rounded-xl shadow-xl border border-white/10 w-full
      "
    >
      <div className="absolute inset-0 z-0 overflow-hidden rounded-xl">
        <div className="absolute -top-1/3 -left-1/3 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <motion.div
          className="absolute w-80 h-80 bg-orange-500/20 rounded-full filter blur-2xl"
          animate={{
            x: ["100%", "0%", "-20%", "0%", "100%"],
            y: ["100%", "50%", "0%", "50%", "100%"],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Blue blob */}
        <motion.div
          className="absolute w-40 h-40 bg-blue-500/10 rounded-full filter blur-xl"
          animate={{
            x: ["25%", "75%", "50%", "25%"],
            y: ["25%", "75%", "25%", "75%"],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <motion.h2
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`text-4xl font-bold mb-4 text-orange-300 z-10 ${tektur.className}`}
      >
        Contact Requests
      </motion.h2>

      <AnimatePresence>
        {loading ? (
          <motion.p
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-white/80 animate-pulse z-10"
          >
            Loading requests…
          </motion.p>
        ) : requests.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-white/80 text-center text-xl mt-52 z-10"
          >
            No contact requests yet.
          </motion.p>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-y-auto w-full max-w-4xl z-10"
          >
            <AnimatePresence>
              {requests.map((req) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setSelected(req)}
                  className="bg-neutral-900/80 text-white p-4 rounded mb-3 shadow cursor-pointer hover:bg-neutral-800"
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3
                      className={`${tektur.className} text-orange-200 font-bold text-lg truncate`}
                    >
                      {req.name}
                    </h3>
                    <span className="text-sm text-orange-300/70">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-white/90 truncate">
                    {req.message}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-neutral-900 rounded-xl shadow-xl p-6 max-w-md w-full"
            >
              <h3
                className={`${tektur.className} text-2xl font-bold text-orange-300 mb-2`}
              >
                {selected.name}
              </h3>
              <p className="text-sm text-orange-800 mb-4">
                {new Date(selected.createdAt).toLocaleString()}
              </p>
              <p className="text-white mb-4 whitespace-pre-wrap">
                {selected.message}
              </p>
              <div className="flex justify-end gap-3 mt-4">
                <a
                  href={`mailto:${selected.email}`}
                  className="bg-cyan-600 hover:bg-cyan-700 px-4 py-1.5 rounded text-sm text-white"
                >
                  Reply via Email
                </a>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-1.5 rounded text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ContactRequestsSection;
