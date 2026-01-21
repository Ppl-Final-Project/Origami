export interface ParseError {
  line: number;
  column: number;
  message: string;
  expected?: string;
  found?: string;
  length: number;
  severity: "error" | "warning";
}

export interface ParseResult {
  success: boolean;
  errors: ParseError[];
  ast?: any; // Abstract Syntax Tree (to be implemented)
}
