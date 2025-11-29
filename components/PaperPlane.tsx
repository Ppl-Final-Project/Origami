"use client";
//TODO: Change Paper Plane Icon on a much appealing one this is just a sample only
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
        x: [0, 50, 100, 50, 0],
        y: [0, -20, 0, -10, 0],
        rotate: [0, 5, -5, 3, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M10 50 L80 20 L60 50 L80 80 L10 50 Z"
          fill="currentColor"
          className="text-blue-500 dark:text-blue-400"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        <motion.path
          d="M10 50 L60 50 L80 20"
          stroke="currentColor"
          strokeWidth="2"
          className="text-blue-600 dark:text-blue-300"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 1 }}
        />
        <motion.path
          d="M60 50 L80 80"
          stroke="currentColor"
          strokeWidth="2"
          className="text-blue-600 dark:text-blue-300"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 1.2 }}
        />
      </svg>
    </motion.div>
  );
}
