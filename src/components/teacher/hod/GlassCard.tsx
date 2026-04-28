"use client";
import React from 'react'
import { motion } from "framer-motion";

const GlassCard = ({ children }: { children: React.ReactNode }) => {
  return (

    <motion.div
      whileHover={{ scale: 1.03 }}
      className="relative p-5 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl overflow-hidden"
    >
      {children}

      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    </motion.div>
  )
}

export default GlassCard