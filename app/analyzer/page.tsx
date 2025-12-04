"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import CodeSandbox from "@/components/CodeSandbox";
import Table from "@/components/Table";
import { analyze } from "@/lib/lexer";
import { Token } from "@/types";

export default function LexicalAnalyzer() {
  const [code, setCode] = useState("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    setTheme(savedTheme || "dark");
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const handleAnalyze = () => {
    const result = analyze(code);
    setTokens(result);
  };

  return (
    <div className="h-screen flex flex-col bg-[#02367B] dark:bg-[#02367B] text-white dark:text-white">
  {/* Header */}
  <header className="h-16 border-b border-gray-700/50 px-4 flex justify-between items-center backdrop-blur-sm bg-black/20">
    <img
        src="/mainlogo.png"
        alt="Origami"
        className="w-40 h-40 object-contain"
      />
    <div className="flex items-center gap-4">
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-2 px-4 py-2 rounded bg-gradient-to-r from-[#006CA5] to-[#0496C7] hover:from-[#0496C7] hover:to-[#04BADE] text-white transition group"
        title="Back to Start">
        <img
          src="/arrow-uturn-left.png"
          alt="Back"
          className="w-5 h-5 transform group-hover:scale-110 transition-transform filter brightness-0 invert"
        />
        <span className="hidden sm:inline">Back</span>
      </button>
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="px-4 py-2 rounded bg-white/20 hover:bg-white/30 transition backdrop-blur-sm">
        <img
          src={theme === "dark" ? "/light.png" : "/dark.png"}
          alt="toggle theme"
          className="w-5 h-5 filter brightness-0 invert"
        />
      </button>
    </div>
  </header>

  {/* Split View */}
  <div className="flex-1 flex overflow-hidden">
    {/* Left: Code Editor */}
    <div className="w-1/2 border-r border-gray-700/50 flex flex-col p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Code Editor</h2>
          <button
            onClick={handleAnalyze}
            className="px-4 py-2 rounded bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium transition shadow-lg hover:shadow-xl">
            Analyze
          </button>
        </div>
        <div className="flex-1 border border-gray-700/50 rounded overflow-hidden shadow-lg backdrop-blur-sm bg-black/30">
          <CodeSandbox
            value={code}
            onChange={setCode}
            theme={theme as "light" | "dark"}
          />
        </div>
    </div>

    {/* Right: Token Table */}
    <div className="w-1/2 flex flex-col p-4">
        <h2 className="text-lg font-semibold mb-5">
          Tokens ({tokens.length})
        </h2>
        <div className="flex-1 border border-gray-700/50 rounded overflow-hidden shadow-lg backdrop-blur-sm bg-black/30">
          <Table tokens={tokens} />
        </div>
      </div>
    </div>
</div>
  );
}