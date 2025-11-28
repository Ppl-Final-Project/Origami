"use client";

import Editor from "@monaco-editor/react";

interface CodeSandboxProps {
  value: string;
  onChange: (value: string) => void;
  theme: "light" | "dark";
}

export default function CodeSandbox({
  value,
  onChange,
  theme,
}: CodeSandboxProps) {
  return (
    <Editor
      key={theme}
      height="100%"
      defaultLanguage="javascript"
      value={value}
      onChange={(value) => onChange(value || "")}
      theme={theme === "dark" ? "vs-dark" : "vs"}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
}
