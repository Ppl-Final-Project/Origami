import { Token, TokenType } from "@/types";

// Keywords
const KEYWORDS: Record<string, TokenType> = {
  // Variable types
  edge: TokenType.EDGE,
  mark: TokenType.MARK,
  thick: TokenType.THICK,
  thin: TokenType.THIN,
  crease: TokenType.CREASE,
  flat: TokenType.FLAT,
  Strip: TokenType.STRIP,
  
  // Control flow
  figure: TokenType.FIGURE,
  center: TokenType.CENTER,
  back: TokenType.BACK,
  front: TokenType.FRONT,
  isolate: TokenType.ISOLATE,
  
  // Loops
  work: TokenType.WORK,
  layer: TokenType.LAYER,
  spiral: TokenType.SPIRAL,
  as: TokenType.AS,
  
  // State manipulation
  tear: TokenType.TEAR,
  flip: TokenType.FLIP,
  reveal: TokenType.REVEAL,
  smooth: TokenType.SMOOTH,
  crumple: TokenType.CRUMPLE,
  
  // Functions & structures
  draft: TokenType.DRAFT,
  craft: TokenType.CRAFT,
  fold: TokenType.FOLD,
  unfold: TokenType.UNFOLD,
  open: TokenType.OPEN,
  inherit: TokenType.INHERIT,
  attach: TokenType.ATTACH,
  out: TokenType.OUT,
  blueprint: TokenType.BLUEPRINT,
  
  // Declarations
  sheet: TokenType.SHEET,
  guide: TokenType.GUIDE,
  sealed: TokenType.SEALED,
  blank: TokenType.BLANK,

  // Reserved words
  kachi: TokenType.KACHI,
  
  // Boolean values
  aligned: TokenType.ALIGNED,
  misaligned: TokenType.MISALIGNED,
  under: TokenType.UNDER,
};

// Operators
const OPERATORS: Record<string, TokenType> = {
  // Three-character operators
  "**=": TokenType.POWER_ASSIGN,
  
  // Two-character operators
  "**": TokenType.POWER,
  "++": TokenType.INCREMENT,
  "--": TokenType.DECREMENT,
  "+=": TokenType.PLUS_ASSIGN,
  "-=": TokenType.MINUS_ASSIGN,
  "*=": TokenType.MULTIPLY_ASSIGN,
  "/=": TokenType.DIVIDE_ASSIGN,
  "%=": TokenType.MODULO_ASSIGN,
  "==": TokenType.EQUAL,
  "!=": TokenType.NOT_EQUAL,
  "<=": TokenType.LESS_EQUAL,
  ">=": TokenType.GREATER_EQUAL,
  "&&": TokenType.AND,
  "||": TokenType.OR,
  "->": TokenType.ARROW,
  
  // Single-character operators
  "+": TokenType.PLUS,
  "-": TokenType.MINUS,
  "*": TokenType.MULTIPLY,
  "/": TokenType.DIVIDE,
  "%": TokenType.MODULO,
  "=": TokenType.ASSIGN,
  "<": TokenType.LESS_THAN,
  ">": TokenType.GREATER_THAN,
  "!": TokenType.NOT,
  "?": TokenType.QUESTION,
  ":": TokenType.COLON,
};

// Punctuation
const PUNCTUATIONS: Record<string, TokenType> = {
  ".": TokenType.DOT,
  ";": TokenType.SEMICOLON,
  ",": TokenType.COMMA,
  "(": TokenType.LPAREN,
  ")": TokenType.RPAREN,
  "{": TokenType.LBRACE,
  "}": TokenType.RBRACE,
  "[": TokenType.LBRACKET,
  "]": TokenType.RBRACKET,
};

/**
 * LexicalAnalyzer class - converts raw source code into a stream of tokens
 */
class LexicalAnalyzer {
  private input: string;
  private tokens: Token[];
  private line: number;
  private column: number;
  private i: number;

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

      // Check for three-character operators first
      const threeChar = this.input.substring(this.i, this.i + 3);
      if (threeChar in OPERATORS) {
        this.tokens.push({
          type: OPERATORS[threeChar],
          value: threeChar,
          line: this.line,
          column: this.column,
        });
        this.i += 3;
        this.column += 3;
        continue;
      }

      // Check for two-character operators
      const twoChar = this.input.substring(this.i, this.i + 2);
      if (twoChar in OPERATORS) {
        this.tokens.push({
          type: OPERATORS[twoChar],
          value: twoChar,
          line: this.line,
          column: this.column,
        });
        this.i += 2;
        this.column += 2;
        continue;
      }

      // Check for single-character operators
      if (currentChar in OPERATORS) {
        this.tokens.push({
          type: OPERATORS[currentChar],
          value: currentChar,
          line: this.line,
          column: this.column,
        });
        this.i++;
        this.column++;
        continue;
      }

      // Handle punctuation marks
      if (currentChar in PUNCTUATIONS) {
        this.tokens.push({
          type: PUNCTUATIONS[currentChar],
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

    // Check if it's a keyword and get its specific token type
    if (value in KEYWORDS) {
      this.tokens.push({
        type: KEYWORDS[value],
        line: this.line,
        column: startCol,
        value,
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