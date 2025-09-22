"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

const ProfileCard = () => {
  return (
    <motion.div
      className="flex items-center justify-center gap-2 rounded-full border-2 
                 px-3 py-1 w-[10rem] 
                 lg:px-5 lg:py-2 lg:w-[12rem]"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex flex-col items-center justify-center">
        <span className="font-semibold text-sm lg:text-base">ClassifyAI</span>
        <span className="text-xs">Assistant</span>
      </div>
      <Image
        src="/only-logo.png"
        alt="App Logo"
        width={70}
        height={50}
        className="invert w-12 h-auto lg:w-[70px]"
      />
    </motion.div>
  );
};

export default ProfileCard;
