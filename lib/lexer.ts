import { Token, TokenType } from "@/types";

// Keywords
const KEYWORDS = new Set([
  // Variable types
  "edge",
  "mark",
  "thick",
  "thin",
  "crease",
  "flat",
  
  // Control flow
  "figure",
  "center",
  "back",
  "front",
  "isolate",
  
  // Loops
  "work",
  "layer",        
  "spiral",
  "as",          
  
  // State manipulation
  "tear",
  "flip",
  "reveal",
  "smooth",
  "crumple",
  
  // Functions & structures
  "draft",
  "craft",
  "fold",
  "unfold",
  "open",
  "inherit",
  "attach", 
  "out",
  "blueprint",       
  
  // Declarations
  "sheet",
  "guide",
  "sealed",
  "blank",
  
  // Boolean values
  "aligned",
  "misaligned",
  "under",
]);

// Operators
const OPERATORS = new Set([
  "+", "-", "*", "/", "%", "**",      // Arithmetic
  "++", "--",                          // Increment/Decrement
  "=", "+=", "-=", "*=", "/=", "%=", "**=",  // Assignment
  "==", "!=", "<", ">", "<=", ">=",   // Comparison
  "&&", "||", "!",                     // Logical
  "->",                                // Function attachment
  "?", ":",                            // Ternary operators
]);

// Define punctuation - structural symbols
const PUNCTUATIONS = new Set([".", ";", ",", "(", ")", "{", "}", "[", "]"]);

/**
 * LexicalAnalyzer class - converts raw source code into a stream of tokens
 */
class LexicalAnalyzer {
  private input: string;      // Source code to tokenize
  private tokens: Token[];    // Array to store generated tokens
  private line: number;       // Current line number (for error reporting)
  private column: number;     // Current column number (for error reporting)
  private i: number;          // Current position in input string

  constructor(input: string) {
    this.input = input;
    this.tokens = [];
    this.line = 1;
    this.column = 1;
    this.i = 0;
  }

  // Check if end of input has been reached
  private isAtEnd(): boolean {
    return this.i >= this.input.length;
  }

  // Look ahead at upcoming characters without moving position
  private peek(offset: number = 0): string | undefined {
    return this.input[this.i + offset];
  }

  // Main loop that processes input character by character and generates tokens
  tokenize(): Token[] {
    while (!this.isAtEnd()) {
      const currentChar = this.input[this.i] as string;

      // Skip whitespace (spaces, tabs, newlines)
      if (/\s/.test(currentChar)) {
        this.skipWhitespace();
        continue;
      }

      // Skip single-line comments
      if (currentChar === "/" && this.peek(1) === "/") {
        this.skipComment();
        continue;
      }

      // Skip multi-line comments
      if (currentChar === "/" && this.peek(1) === "*") {
        this.skipMultiLineComment();
        continue;
      }

      // Handle string literals (double quotes, single quotes, or backticks)
      if (currentChar === '"' || currentChar === "'" || currentChar === "`") {
        this.handleString(currentChar);
        continue;
      }

      // Handle numeric literals
      if (/\d/.test(currentChar)) {
        this.handleNumber();
        continue;
      }

      // Handle identifiers and keywords
      if (/[a-zA-Z]/.test(currentChar)) {
        this.handleIdentifierOrKeyword();
        continue;
      }

      // Check for two-character operators first
      const twoChar = this.input.substring(this.i, this.i + 2);
      if (OPERATORS.has(twoChar)) {
        this.tokens.push({
          type: TokenType.OPERATOR,
          value: twoChar,
          line: this.line,
          column: this.column,
        });
        this.i += 2;
        this.column += 2;
        continue;
      }

      // Check for single-character operators
      if (OPERATORS.has(currentChar)) {
        this.tokens.push({
          type: TokenType.OPERATOR,
          value: currentChar,
          line: this.line,
          column: this.column,
        });
        this.i++;
        this.column++;
        continue;
      }

      // Handle punctuation marks
      if (PUNCTUATIONS.has(currentChar)) {
        this.tokens.push({
          type: TokenType.SEPARATOR,
          value: currentChar,
          line: this.line,
          column: this.column,
        });
        this.i++;
        this.column++;
        continue;
      }

      // Handle unrecognized characters
      this.tokens.push({
        type: TokenType.UNKNOWN,
        value: currentChar,
        line: this.line,
        column: this.column,
      });
      this.i++;
      this.column++;
    }

    // Add End of File token to mark completion
    this.tokens.push({
      type: TokenType.EOF,
      value: "",
      line: this.line,
      column: this.column,
    });

    return this.tokens;
  }

  // Skip whitespace
  private skipWhitespace(): void {
    while (!this.isAtEnd() && /\s/.test(this.input[this.i] as string)) {
      if (this.input[this.i] === "\n") {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.i++;
    }
  }

  // Skip single-line comments until newline
  private skipComment(): void {
    while (!this.isAtEnd() && this.input[this.i] !== "\n") {
      this.i++;
      this.column++;
    }
  }

  // Skip multi-line comments until closing */
  private skipMultiLineComment(): void {
    this.i += 2;
    this.column += 2;

    while (!this.isAtEnd()) {
      if (this.input[this.i] === "*" && this.peek(1) === "/") {
        this.i += 2;
        this.column += 2;
        return;
      }

      if (this.input[this.i] === "\n") {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.i++;
    }
  }

  // Process strings and template literals, handling escapes and ${} interpolations
  private handleString(quote: string): void {
    const start = this.i;
    const startCol = this.column;
    const isTemplateLiteral = quote === "`";
    this.i++;
    this.column++;

    // Continue until we find the closing quote
    while (!this.isAtEnd() && this.input[this.i] !== quote) {
      // Handle escape sequences (\n, \t, \", etc.)
      if (this.input[this.i] === "\\") {
        this.i++;
        this.column++;
        if (!this.isAtEnd()) {
          this.i++;
          this.column++;
        }
        continue;
      }

      // Handle template literal interpolations ${...}
      if (
        isTemplateLiteral &&
        this.input[this.i] === "$" &&
        this.peek(1) === "{"
      ) {
        this.i += 2;
        this.column += 2;

        // Track nested braces to find matching closing brace
        let braceDepth = 1;
        while (!this.isAtEnd() && braceDepth > 0) {
          if (this.input[this.i] === "{") braceDepth++;
          if (this.input[this.i] === "}") braceDepth--;
          this.i++;
          this.column++;
        }
        continue;
      }

      if (!this.isAtEnd()) {
        this.i++;
        this.column++;
      }
    }

    // Consume closing quote if present
    if (!this.isAtEnd()) {
      this.i++;
      this.column++;
    }

    this.tokens.push({
      type: isTemplateLiteral ? TokenType.TEMPLATE_LITERAL : TokenType.STRING,
      value: this.input.substring(start, this.i),
      line: this.line,
      column: startCol,
    });
  }

  // Process numeric literals including decimals
  private handleNumber(): void {
    const start = this.i;
    const startCol = this.column;

    // Consume integer part
    while (!this.isAtEnd() && /\d/.test(this.input[this.i] as string)) {
      this.i++;
      this.column++;
    }
    
    // Handle decimal point and fractional part
    if (!this.isAtEnd() && this.input[this.i] === ".") {
      this.i++;
      this.column++;
      while (!this.isAtEnd() && /\d/.test(this.input[this.i] as string)) {
        this.i++;
        this.column++;
      }
    }

    this.tokens.push({
      type: TokenType.NUMBER,
      value: this.input.substring(start, this.i),
      line: this.line,
      column: startCol,
    });
  }

  // Process identifiers and check if they're keywords
  private handleIdentifierOrKeyword(): void {
    const start = this.i;
    const startCol = this.column;

    // Consume all valid identifier characters
    while (
      !this.isAtEnd() &&
      /[a-zA-Z0-9_]/.test(this.input[this.i] as string)
    ) {
      // Stop if we encounter consecutive underscores
      if (
        this.input[this.i] === "_" &&
        this.i > start &&
        this.input[this.i - 1] === "_"
      ) {
        break;
      }
      this.i++;
      this.column++;
    }

    // Back up if the identifier ends with underscore(s)
    let end = this.i;
    while (end > start && this.input[end - 1] === "_") {
      end--;
      this.column--;
    }
    this.i = end;

    const value = this.input.substring(start, this.i);

    // Determine if this is a keyword or regular identifier
    if (KEYWORDS.has(value)) {
      this.tokens.push({
        type: TokenType.KEYWORD,
        value,
        line: this.line,
        column: startCol,
      });
      return;
    }

    this.tokens.push({
      type: TokenType.IDENTIFIER,
      value,
      line: this.line,
      column: startCol,
    });
  }
}

// Entry point to tokenize source code
export function analyze(input: string): Token[] {
  const lexer = new LexicalAnalyzer(input);
  return lexer.tokenize();
}