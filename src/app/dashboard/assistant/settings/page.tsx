"use client";
import React, { useState } from "react";
import { SECTIONS } from "@/lib/helper";
import { AnimatePresence, motion } from "framer-motion";
import ChangeEmailSection from "@/components/assistant/settings/ChangeEmailSection";
import ContactRequestsSection from "@/components/assistant/settings/ContactRequestsSection";
import ManageLogsSection from "@/components/assistant/settings/ManageLogsSection";
import ManagePlansSection from "@/components/assistant/settings/ManagePlansSection";
import ExportLogsSection from "@/components/assistant/settings/ExportLogsSection";
const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState("email");
  return (
      <div className="min-h-screen w-full px-4 py-8 text-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 text-sm text-center gap-2 mb-8 max-w-4xl mx-auto">
        {SECTIONS.map((sec) => (
          <div
            key={sec.key}
            onClick={() => setActiveSection(sec.key)}
            className={`py-4 px-2 rounded-xl cursor-pointer text-center transition-all duration-300 ${
              activeSection === sec.key
                ? "bg-orange-700 text-white shadow-lg"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            <span className="font-semibold">{sec.label}</span>
          </div>
        ))}
      </div>
      
      <div className="max-w-4xl mx-auto mt-6">
        <AnimatePresence mode="wait">
          {activeSection === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ChangeEmailSection />
            </motion.div>
          )}

          {activeSection === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ContactRequestsSection />
            </motion.div>
          )}
          {activeSection === "logs" && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ManageLogsSection />
            </motion.div>
          )}
          {activeSection === "plans" && (
            <motion.div
              key="plans"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ManagePlansSection />
            </motion.div>
          )}
          {activeSection === "export" && (
            <motion.div
              key="export"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ExportLogsSection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SettingsPage;
