"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import CodeSandbox from "@/components/CodeSandbox";
import Table from "@/components/Table";
import { analyze } from "@/lib/lexer";
import { Token } from "@/types";

export default function LexicalAnalyzer() {
  const [code, setCode] = useState(
    `open fold SAMPLE1
edge length = 10;
thick width = 2.5;
thin height = 0.5;
mark label = 'X';
crease angle = 45;
flat surface = aligned;
mark template = \`Hello \${label}, value is \${width}\`;

figure(length > 5) {
    center;
    work(crease i = 0; i < 3; i++) {
        layer(angle < 90) {
            spiral(label) {
                flip;
                reveal;
            }
        }
    }
    front {
        tear;
    }
    back {
        smooth;
    }
}

sealed craft createOrigami() {
    draft {
        // This is a comment
        crumple;
    }
}

// Test optional chaining and invalid identifiers
mark result = user?.profile?.name;
InvalidName = "test"; // Should be UNKNOWN_IDENTIFIER
validVariable = "test"; // Should be IDENTIFIER`
  );
  const [tokens, setTokens] = useState<Token[]>([]);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const result = analyze(code);
    setTokens(result);
  }, [code]);

  if (!mounted) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* Header */}
      <header className="border-b border-gray-300 dark:border-gray-700 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">ORIGAMI </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => (window.location.href = "/")}
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
            {theme === "dark" ? (
              <img
                src="/light.png"
                alt="light"
                className="w-5 h-5 transform group-hover:scale-110 transition-transform filter brightness-0 invert"
              />
            ) : (
              <img
                src="/dark.png"
                alt="light"
                className="w-5 h-5 transform group-hover:scale-110 transition-transform filter brightness-0 invert"
              />
            )}
          </button>
        </div>
      </header>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Code Editor */}
        <div className="w-1/2 border-r border-gray-300 dark:border-gray-700">
          <div className="h-full p-4">
            <h2 className="text-lg font-semibold mb-2">Code Editor</h2>
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