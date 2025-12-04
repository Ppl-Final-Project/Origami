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
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Left side dots */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`left-${i}`}
            className="absolute w-2 h-2 bg-blue-300 dark:bg-blue-600 rounded-full opacity-30"
            animate={{
              x: [0, 100, 200, 300, 400],
              y: [
                100 + i * 100,
                50 + i * 80,
                150 + i * 90,
                80 + i * 110,
                120 + i * 95,
              ],
              scale: [1, 1.5, 1, 0.8, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
            style={{
              left: `${-10 + i * 15}%`,
              top: `${10 + i * 15}%`,
            }}
          />
        ))}
        {/* Right side dots */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`right-${i}`}
            className="absolute w-2 h-2 bg-blue-300 dark:bg-blue-600 rounded-full opacity-30"
            animate={{
              x: [0, -100, -200, -300, -400],
              y: [
                80 + i * 90,
                120 + i * 100,
                60 + i * 85,
                140 + i * 95,
                100 + i * 110,
              ],
              scale: [1, 1.2, 1, 1.4, 1],
            }}
            transition={{
              duration: 9 + i * 1.5,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeInOut",
            }}
            style={{
              right: `${-10 + i * 15}%`,
              top: `${15 + i * 14}%`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="text-center z-10 max-w-4xl px-6">
        {/* Animated Origami Logo */}
        <motion.div
          className="mb-0 -mt-40"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.img
            src="/mainlogo.png"
            alt="Origami Logo"
            className="mx-auto -mb-60 object-contain"
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

        {/* Description */}
        <motion.p
          className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed -mt-30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
        >
          The programming language aims to make coding both creative and structured. It visualizes each function, loop, 
          and condition as a “fold” that contributes to a complete logical design, transforming abstract code into something 
          intuitive and elegant.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4 }}
        >
          <motion.button
            className="px-8 py-4 bg-[#006CA5] hover:bg-[#02367B] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px]"
            onClick={handleStartClick}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Analyzing
          </motion.button>

          <motion.button
            className="px-8 py-4 border-2 border-blue-500 dark:border-blue-400 text-blue-500 dark:text-blue-400 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-400 dark:hover:text-gray-900 font-semibold rounded-full transition-all duration-300 min-w-[200px]"
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

        {/* Features */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.8 }}
        ></motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-10 left-10">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <img
            src="/solologo.png"
            alt="Origami"
            className="w-50 h-50 opacity-20 object-contain"
          />
        </motion.div>
      </div>

      <div className="absolute top-32 left-16">
        <motion.div
          animate={{
            rotate: -360,
            y: [-12, 12, -12],
          }}
          transition={{
            rotate: { duration: 23, repeat: Infinity, ease: "linear" },
            y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <img
            src="/solologo.png"
            alt="Origami"
            className="w-50 h-50 opacity-12 object-contain"
          />
        </motion.div>
      </div>

      <div className="absolute bottom-1/3 left-24">
        <motion.div
          animate={{
            rotate: 360,
            x: [-8, 8, -8],
          }}
          transition={{
            rotate: { duration: 19, repeat: Infinity, ease: "linear" },
            x: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <img
            src="/origamilogo.png"
            alt="Origami"
            className="w-9 h-9 opacity-10 object-contain"
          />
        </motion.div>
      </div>

      <div className="absolute top-20 right-20">
        <motion.div
          animate={{
            rotate: -360,
            y: [-10, 10, -10],
          }}
          transition={{
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <img
            src="/origamilogo.png"
            alt="Origami"
            className="w-10 h-10 opacity-15 object-contain"
          />
        </motion.div>
      </div>

      <div className="absolute top-1/3 right-10">
        <motion.div
          animate={{
            rotate: 360,
            x: [-5, 5, -5],
          }}
          transition={{
            rotate: { duration: 18, repeat: Infinity, ease: "linear" },
            x: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <img
            src="/solologo.png"
            alt="Origami"
            className="w-60 h-60 opacity-10 object-contain"
          />
        </motion.div>
      </div>

      <div className="absolute bottom-1/4 right-32">
        <motion.div
          animate={{
            rotate: -360,
            y: [-15, 15, -15],
          }}
          transition={{
            rotate: { duration: 22, repeat: Infinity, ease: "linear" },
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <img
            src="/origamilogo.png"
            alt="Origami"
            className="w-8 h-8 opacity-12 object-contain"
          />
        </motion.div>
      </div>
    </div>
  );
}
