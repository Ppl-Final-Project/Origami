"use client";

import { motion } from "framer-motion";

interface PaperPlaneProps {
  className?: string;
  size?: number;
}

export default function PaperPlane({
  className = "",
  size = 100,
}: PaperPlaneProps) {
  return (
    <motion.div
      className={`inline-block ${className}`}
      animate={{
        y: [0, -15, 0, -8, 0],
        rotate: [0, 3, -2, 1, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 800 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left Wing */}
        <motion.path
          d="M168.667 29.333 L418.667 244.666 L273.333 445.333 L123.333 358.666 L168.667 29.333Z"
          fill="#7DB8CC"
          className="opacity-90"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 0.9, x: 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        />

        {/* Right Wing */}
        <motion.path
          d="M418.667 96.667 L676.667 29.333 L545.333 527.333 L418.667 244.666 L418.667 96.667Z"
          fill="#7DB8CC"
          className="opacity-90"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 0.9, x: 0 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        />

        {/* Body Main */}
        <motion.path
          d="M273.333 445.333 L418.667 244.666 L545.333 527.333 L387.333 479.333 L273.333 445.333Z"
          fill="#8DC4D6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        {/* Head/Neck Section */}
        <motion.path
          d="M123.333 358.666 L273.333 445.333 L256.667 527.333 L123.333 358.666Z"
          fill="#9DD1E0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        />

        {/* Small Head Triangle */}
        <motion.path
          d="M110.667 351.333 L123.333 358.666 L123.333 373.333 L110.667 351.333Z"
          fill="#6BA5BA"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        />

        {/* Fold Lines */}
        <motion.path
          d="M273.333 445.333 L387.333 479.333"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 1.5, delay: 1 }}
        />
        <motion.path
          d="M361.333 335.333 L545.333 527.333"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 1.5, delay: 1.1 }}
        />
        <motion.path
          d="M255.333 332.666 L123.333 358.666"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 1.5, delay: 1.2 }}
        />
        <motion.path
          d="M266.667 484.666 L256.667 527.333"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 1.5, delay: 1.3 }}
        />
      </svg>
    </motion.div>
  );
}
