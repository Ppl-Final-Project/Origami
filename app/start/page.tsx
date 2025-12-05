"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function StartPage() {
  const router = useRouter();

  const handleStartClick = () => {
    router.push("/analyzer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 z-0">
        <img
          src="/crumple.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="text-center z-10 max-w-4xl px-6">
        <motion.div
          className="mb-0 -mt-40"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.img
            src="/mainlogo.png"
            alt="Origami Logo"
            className="mx-auto -mb-40 object-contain"
            animate={{
              y: [0, -15, 0, -8, 0],
              rotate: [0, 3, -2, 1, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        <motion.p
          className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed -mt-30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
        >
          The programming language aims to make coding both creative and
          structured. It visualizes each function, loop, and condition as a
          “fold” that contributes to a complete logical design, transforming
          abstract code into something intuitive and elegant.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4 }}
        >
          <motion.button
            className="px-8 py-4 bg-yellow-500 hover:bg-blue-400 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px]"
            onClick={handleStartClick}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Analyzing
          </motion.button>

          <motion.button
            className="px-8 py-4 border-2 border-yellow-500 dark:border-yellow-400 text-yellow-500 dark:text-blue-400 hover:bg-yellow-500 hover:text-white dark:hover:bg-blue-400 dark:hover:text-white font-semibold rounded-full transition-all duration-300 min-w-[200px]"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              window.open(
                "https://github.com/Ppl-Final-Project/Origami",
                "_blank"
              )
            }
          >
            View on GitHub
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
