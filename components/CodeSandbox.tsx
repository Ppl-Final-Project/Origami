"use client";

// Recognizes Origami Language in the Editor
import Editor from "@monaco-editor/react";
import { forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import { ParseError } from "@/types";

interface CodeSandboxProps {
  value: string;
  onChange: (value: string) => void;
  theme: "light" | "dark";
  errors?: ParseError[];
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
        /\b(fold|unfold|edge|mark|thick|thin|crease|flat|figure|center|back|front|isolate|work|layer|spiral|tear|flip|reveal|smooth|crumple|draft|blueprint|inherit|craft|open|guide|under|sheet|sealed|attach|out|Strip)\b/,
        "keyword",
      ],

      [/\b(aligned|misaligned|blank)\b/, "type"],

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

export interface CodeSandboxHandle {
  getValue: () => string;
}

// grabbing a reference to get the contents of the code box.
const CodeSandbox = forwardRef<CodeSandboxHandle, CodeSandboxProps>(
  ({ value, onChange, theme, errors = [] }, ref) => {
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);

    const handleEditorDidMount = (editor: any, monaco: any) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      if (
        !monaco.languages
          .getLanguages()
          .find((lang: any) => lang.id === "origami")
      ) {
        monaco.languages.register(origamiLanguageConfig);
        monaco.languages.setMonarchTokensProvider(
          "origami",
          origamiTokensProvider,
        );
      }
    };

    // Update error markers when errors change
    useEffect(() => {
      if (editorRef.current && monacoRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          const markers = errors.map((error) => ({
            severity: monacoRef.current.MarkerSeverity.Error,
            startLineNumber: error.line,
            startColumn: error.column,
            endLineNumber: error.line,
            endColumn: error.column + (error.length || 1),
            message: error.message,
            source: "Origami Parser",
          }));
          monacoRef.current.editor.setModelMarkers(model, "origami", markers);
        }
      }
    }, [errors]);

    useImperativeHandle(ref, () => ({
      getValue: () => editorRef.current?.getValue() ?? "",
    }));

    return (
      <Editor
        key={theme}
        height="100%"
        defaultLanguage="origami"
        value={value}
        onChange={(v) => onChange(v || "")}
        theme={theme === "dark" ? "vs-dark" : "vs"}
        onMount={handleEditorDidMount}
      />
    );
  },
);

export default CodeSandbox;
