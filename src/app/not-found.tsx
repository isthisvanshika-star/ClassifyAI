"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-indigo-900/50 via-purple-900/70 to-black text-white overflow-hidden">
      {/* Floating particles */}
<motion.div
  className="absolute -z-10 inset-0"
  initial={{ opacity: 0 }}
  animate={{ opacity: 0.2 }}
  transition={{ duration: 2 }}
>
  <Sparkles className="w-full h-full text-indigo-400 animate-pulse " />
</motion.div>


      {/* 404 text */}
<motion.h1
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="flex items-center gap-2 drop-shadow-lg"
      >
        <span className="text-9xl font-extrabold bg-gradient-to-r from-cyan-500 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          4
        </span>
        <span className="text-7xl font-extrabold text-gray-200">0</span>
        <span className="text-9xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-500 bg-clip-text text-transparent">
          4
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-xl mt-4 text-gray-300"
      >
        Oops! The page you’re looking for doesn’t exist in <span className="font-bold text-indigo-400 uppercase">ClassifyAI</span>.
      </motion.p>

      {/* Call to action */}
         <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-8"
      >
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Link
            href="/auth/login"
            className="flex items-center gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl shadow-lg transition duration-300"
          >
            <ArrowLeft size={20} />
            Go Back Home
          </Link>
        </motion.div>
      </motion.div>
      {/* Animated background elements */}
      <motion.div
        className="absolute -bottom-20 w-[500px] h-[500px] bg-indigo-700 rounded-full blur-3xl opacity-30"
        animate={{ y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -top-20 right-10 w-[400px] h-[400px] bg-purple-600 rounded-full blur-3xl opacity-30"
        animate={{ y: [0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
      />
    </div>
  );
}
