"use client";

import React from "react";
import { motion } from "framer-motion";
const Logo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-2 lg:mt-5"
    >
      <motion.div
        initial={{ rotate: -20, scale: 0.8 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
      >
        <img
          src="/only-logo.png"
          width={80}
          height={80}
          className="invert w-10 h-10 lg:w-30 lg:h-20"
          alt="ClassifyAI Logo"
        />
      </motion.div>
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="hidden lg:inline-block text-4xl"
      >
        Classify <span className="text-orange-600 -ml-2">AI</span>
      </motion.span>
    </motion.div>
  );
};

export default Logo;
