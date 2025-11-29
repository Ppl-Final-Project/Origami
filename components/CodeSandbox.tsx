"use client";
// Recognizes Origami Language in the Editor
import Editor from "@monaco-editor/react";

interface CodeSandboxProps {
  value: string;
  onChange: (value: string) => void;
  theme: "light" | "dark";
}

const origamiLanguageConfig = {
  id: "origami",
  extensions: [".ori"],
  aliases: ["Origami", "origami"],
  mimetypes: ["text/origami"],
};

const origamiTokensProvider = {
  tokenizer: {
    root: [
      [
        /\b(open|fold|edge|thick|thin|mark|crease|flat|figure|center|work|layer|spiral|flip|reveal|front|back|sealed|craft|draft|tear|smooth|crumple)\b/,
        "keyword",
      ],

      [
        /\b(length|width|height|angle|surface|label|template|aligned)\b/,
        "type",
      ],

      [
        /\b(if|else|for|while|do|switch|case|default|break|continue|return)\b/,
        "keyword.control",
      ],

      [/[=!<>]=?/, "operator"],
      [/[+\-*\/++--]/, "operator"],
      [/[&|!]/, "operator"],
      [/[?:]/, "operator"],

      [/\d+\.?\d*/, "number"],

      [/'[^']*'/, "string"],
      [/`[^`]*`/, "string"],

      [/\/\/.*$/, "comment"],
      [/\/\*.*?\*\//, "comment"],

      [/[;,.]/, "delimiter"],
      [/[{}()\[\]]/, "bracket"],

      [/[a-zA-Z_][a-zA-Z0-9_]*/, "identifier"],
    ],
  },
};

export default function CodeSandbox({
  value,
  onChange,
  theme,
}: CodeSandboxProps) {
  const handleEditorDidMount = (_editor: any, monaco: any) => {
    if (
      !monaco.languages
        .getLanguages()
        .find((lang: any) => lang.id === "origami")
    ) {
      monaco.languages.register(origamiLanguageConfig);
      monaco.languages.setMonarchTokensProvider(
        "origami",
        origamiTokensProvider
      );
    }
  };

  return (
    <Editor
      key={theme}
      height="100%"
      defaultLanguage="origami"
      value={value}
      onChange={(value) => onChange(value || "")}
      theme={theme === "dark" ? "vs-dark" : "vs"}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: true },
        fontSize: 14,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
}
