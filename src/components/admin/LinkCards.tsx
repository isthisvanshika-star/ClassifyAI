"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";

// --- FONT PLACEHOLDER ---
// Removed the 'next/font' import. We'll apply the class name directly.
const tektur = {
  className: "font-tektur" // Assuming 'font-tektur' is defined in your global CSS
};

// --- MODAL PORTAL (Self-contained) ---
// The ModalPortal logic is now included directly in this file to resolve the import error.
const ModalPortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return mounted ? createPortal(children, document.body) : null;
};


const fetcher = (url: string) => fetch(url).then((res) => res.json());

const LinkCards = ({
  forRole,
  onActionComplete,
}: {
  forRole: "student" | "teacher";
  onActionComplete?: () => void;
}) => {
  const [modalOpen, setModalOpen] = useState<"add" | "remove" | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    branch: "",
    year: "",
    semester: "",
    section: ""
  });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [emailVerified, setEmailVerified] = useState(false);

  const [message, setMessage] = useState<null | {
    type: "success" | "error";
    text: string;
  }>(null);

  const { data: recentUser, isLoading: loadingRecent } = useSWR(
    `/api/admin/recent-user?role=${forRole.toUpperCase()}`,
    fetcher
  );

  const handleSendOtp = async () => {
    if (!formData.email) {
      setMessage({ type: "error", text: "Please enter email" });
      return;
    }
    setLoading(true);
    const res = await fetch("/api/mail/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.email }),
    });
    if (res.ok) {
      setStep("otp");
      setMessage({ type: "success", text: "OTP sent to your email" });
    } else {
      setMessage({ type: "error", text: "Failed to send OTP" });
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setMessage({ type: "error", text: "Please enter OTP" });
      return;
    }
    setLoading(true);
    const res = await fetch("/api/mail/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.email, otp }),
    });
    if (res.ok) {
      setEmailVerified(true);
      setStep("form");
      setMessage({ type: "success", text: "Email verified" });
    } else {
      setMessage({ type: "error", text: "Invalid OTP" });
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (modalOpen === "add" && !emailVerified) {
      setMessage({ type: "error", text: "Please verify email first" });
      return;
    }

    if (!formData.name || !formData.email) {
      setMessage({ type: "error", text: "Name & Email are required" });
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/admin/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: modalOpen,
        name: formData.name,
        email: formData.email,
        role: forRole.toUpperCase(),
        branch: forRole === "student" ? formData.branch : undefined,
        year: forRole === "student" ? formData.year : undefined,
        semester: forRole === "student" ? formData.semester : undefined,
        section: forRole === "student" ? formData.section: undefined,
      }),
    });

    if (res.ok) {
      setMessage({
        type: "success",
        text: `${modalOpen === "add" ? "Added" : "Removed"} successfully`,
      });
      onActionComplete?.();
      setTimeout(() => {
        closeModal();
      }, 1500);
    } else {
      setMessage({ type: "error", text: "Action failed" });
    }
    setLoading(false);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    if (modalOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modalOpen]);

  const closeModal = () => {
    setModalOpen(null);
    setMessage(null);
    setFormData({ name: "", email: "", branch: "", year: "", semester: "", section:"" });
    setOtp("");
    setStep("form");
    setEmailVerified(false);
  };

  return (
    <>
      <div className="h-full border rounded-2xl border-orange-400 w-full flex p-5 justify-center bg-orange-700/5 text-white">
        <div>
          <h5 className={`text-xl text-center ${tektur.className}`}>
            Add or Remove {forRole === "student" ? "Student" : "Teacher"}
          </h5>
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 mt-6 items-center md:items-start">
            <div className="flex flex-col gap-3">
              <button
                className="border w-48 text-center hover:bg-orange-700/20 cursor-pointer hover:border-orange-500 transition-all duration-300 rounded-xl p-4"
                onClick={() => setModalOpen("add")}
              >
                Add {forRole}
              </button>
              <button
                className="border w-48 text-center hover:bg-orange-700/20 cursor-pointer hover:border-orange-500 transition-all duration-300 rounded-xl p-4"
                onClick={() => setModalOpen("remove")}
              >
                Remove {forRole}
              </button>
            </div>
            <div className="mt-2 text-center md:text-left">
              <h6 className="text-lg mb-2">Recent Activity</h6>
              <div>
                {loadingRecent && <p className="animate-pulse text-sm text-gray-500">Loading...</p>}
                {!loadingRecent && recentUser?.name ? (
                  <p>
                    Added:{" "}
                    <strong className="text-orange-300">
                      {recentUser.name}
                    </strong>{" "}
                    <span className="text-xs text-gray-500">
                      ({new Date(recentUser.createdAt).toLocaleDateString()})
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 text-center">
                    No recent {forRole} found
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModalPortal>
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/85 flex justify-center items-center z-50 p-4"
              onClick={closeModal}
            >
              <div
                className="from-orange-800/50 via-orange-300/50 to-orange-800/50 bg-gradient-to-bl p-6 rounded-lg shadow-lg text-black w-full max-w-md relative"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className={`${tektur.className} text-xl mb-4`}>
                  {modalOpen === "add" ? "Add" : "Remove"} {forRole}
                </h2>

                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  autoComplete="off"
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`${tektur.className} w-full ring ring-orange-400 outline-none p-2 rounded mb-2`}
                  disabled={loading}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  autoComplete="off"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`${tektur.className} w-full ring ring-orange-400 outline-none p-2 rounded mb-2`}
                  disabled={loading}
                />

                {forRole === "student" && modalOpen === "add" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Branch"
                      value={formData.branch}
                      onChange={(e) =>
                        setFormData({ ...formData, branch: e.target.value })
                      }
                      className={`${tektur.className} w-full ring ring-orange-400 outline-none p-2 rounded`}
                      disabled={loading}
                    />
                    <input
                      type="number"
                      placeholder="Year"
                      value={formData.year}
                      autoComplete="off"
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                      className={`${tektur.className} w-full ring ring-orange-400 outline-none p-2 rounded`}
                      disabled={loading}
                    />
                    <input
                      type="number"
                      placeholder="Semester"
                      value={formData.semester}
                      autoComplete="off"
                      onChange={(e) =>
                        setFormData({ ...formData, semester: e.target.value })
                      }
                      className={`${tektur.className} w-full ring ring-orange-400 outline-none p-2 rounded`}
                      disabled={loading}
                    />
                     <input
                      type="text"
                      placeholder="Section"
                      value={formData.section}
                      autoComplete="off"
                      onChange={(e) =>
                        setFormData({ ...formData, section: e.target.value })
                      }
                      className={`${tektur.className} w-full ring ring-orange-400 outline-none p-2 rounded`}
                      disabled={loading}
                    />
                  </div>
                )}

                {modalOpen === "add" && step === "otp" && (
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    autoComplete="off"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={`${tektur.className} w-full ring ring-orange-400 outline-none p-2 rounded mb-2`}
                    disabled={loading}
                  />
                )}

                {message && (
                  <div
                    className={`my-2 text-sm text-center ${tektur.className} ${
                      message.type === "success"
                        ? "text-green-800"
                        : "text-red-800"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <div className="flex flex-col justify-end gap-2 mt-4">
                  {modalOpen === "add" ? (
                    <>
                      {step === "form" && !emailVerified && (
                        <button
                          onClick={handleSendOtp}
                          disabled={loading}
                          className={`px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 ${tektur.className}`}
                        >
                          {loading ? "Sending…" : "Send OTP"}
                        </button>
                      )}

                      {step === "otp" && (
                        <button
                          onClick={handleVerifyOtp}
                          disabled={loading}
                          className={`px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 ${tektur.className}`}
                        >
                          {loading ? "Verifying…" : "Verify OTP"}
                        </button>
                      )}

                      {emailVerified && (
                        <button
                          onClick={handleSubmit}
                          disabled={loading}
                          className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${tektur.className}`}
                        >
                          {loading ? "Processing…" : "Add"}
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ${tektur.className}`}
                    >
                      {loading ? "Processing…" : "Remove"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ModalPortal>
    </>
  );
};

export default LinkCards;

