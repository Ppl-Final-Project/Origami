"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import CodeSandbox from "@/components/CodeSandbox";
import Table from "@/components/Table";
import { analyze } from "@/lib/lexer";
import { Token } from "@/types";

export default function LexicalAnalyzer() {
  const [code, setCode] = useState("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleAnalyze = () => {
    const result = analyze(code);
    setTokens(result);
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* Header */}
      <header className="border-b border-gray-300 dark:border-gray-700 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">ORIGAMI</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition group"
            title="Back to Start"
          >
            <img
              src="/arrow-uturn-left.png"
              alt="Back"
              className="w-5 h-5 transform group-hover:scale-110 transition-transform filter brightness-0 invert"
            />
            <span className="hidden sm:inline">Back</span>
          </button>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            <img
              src={theme === "dark" ? "/light.png" : "/dark.png"}
              alt="toggle theme"
              className="w-5 h-5 transform group-hover:scale-110 transition-transform filter brightness-0 invert"
            />
          </button>
        </div>
      </header>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Code Editor */}
        <div className="w-1/2 border-r border-gray-300 dark:border-gray-700">
          <div className="h-full p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Code Editor</h2>
              <button
                onClick={handleAnalyze}
                className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-medium transition"
              >
                Analyze
              </button>
            </div>
            <div className="h-[calc(100%-2rem)] border border-gray-300 dark:border-gray-700 rounded overflow-hidden">
              <CodeSandbox
                value={code}
                onChange={setCode}
                theme={theme as "light" | "dark"}
              />
            </div>
          </div>
        </div>

        {/* Right: Token Table */}
        <div className="w-1/2">
          <div className="h-full p-4">
            <h2 className="text-lg font-semibold mb-2">
              Tokens ({tokens.length})
            </h2>
            <div className="h-[calc(100%-2rem)] border border-gray-300 dark:border-gray-700 rounded overflow-hidden">
              <Table tokens={tokens} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
