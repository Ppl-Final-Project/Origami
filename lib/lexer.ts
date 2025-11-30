import { Token, TokenType } from "@/types";

const KEYWORDS = new Set([
  "edge",
  "mark",
  "thick",
  "thin",
  "crease",
  "flat",
  "figure",
  "center",
  "back",
  "front",
  "isolate",
  "work",
  "layer",
  "spiral",
  "tear",
  "flip",
  "reveal",
  "smooth",
  "crumple",
  "draft",
  "craft",
  "fold",
  "open",
  "inherit",
  "under",
  "sheet",
  "guide",
  "sealed",
  "blank",
  "aligned",
  "misaligned",
]);

const OPERATORS = new Set([
  "+",
  "-",
  "*",
  "/",
  "%",
  "**",
  "++",
  "--",
  "=",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "**=",
  "==",
  "!=",
  "<",
  ">",
  "<=",
  ">=",
  "&&",
  "||",
  "!",
  "?.",
]);

const PUNCTUATIONS = new Set([".", ";", ",", "(", ")", "{", "}", "[", "]"]);

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

  private isAtEnd(): boolean {
    return this.i >= this.input.length;
  }

  private peek(offset: number = 0): string | undefined {
    return this.input[this.i + offset];
  }

  tokenize(): Token[] {
    while (!this.isAtEnd()) {
      const currentChar = this.input[this.i] as string;

      if (/\s/.test(currentChar)) {
        this.skipWhitespace();
        continue;
      }

      if (currentChar === "/" && this.peek(1) === "/") {
        this.skipComment();
        continue;
      }

      if (currentChar === '"' || currentChar === "'" || currentChar === "`") {
        this.handleString(currentChar);
        continue;
      }

      if (/\d/.test(currentChar)) {
        this.handleNumber();
        continue;
      }

      if (/[a-zA-Z_]/.test(currentChar)) {
        this.handleIdentifierOrKeyword();
        continue;
      }

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

      if (PUNCTUATIONS.has(currentChar)) {
        this.tokens.push({
          type: TokenType.PUNCTUATION,
          value: currentChar,
          line: this.line,
          column: this.column,
        });
        this.i++;
        this.column++;
        continue;
      }

      this.tokens.push({
        type: TokenType.UNKNOWN,
        value: currentChar,
        line: this.line,
        column: this.column,
      });
      this.i++;
      this.column++;
    }

    this.tokens.push({
      type: TokenType.EOF,
      value: "",
      line: this.line,
      column: this.column,
    });

    return this.tokens;
  }

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

  private skipComment(): void {
    while (!this.isAtEnd() && this.input[this.i] !== "\n") {
      this.i++;
      this.column++;
    }
  }

  private handleString(quote: string): void {
    const start = this.i;
    const startCol = this.column;
    this.i++;
    this.column++;

    while (!this.isAtEnd() && this.input[this.i] !== quote) {
      if (this.input[this.i] === "\\") {
        this.i++;
        this.column++;
      }
      if (!this.isAtEnd()) {
        this.i++;
        this.column++;
      }
    }
    if (!this.isAtEnd()) {
      this.i++;
      this.column++;
    }

    this.tokens.push({
      type: TokenType.STRING,
      value: this.input.substring(start, this.i),
      line: this.line,
      column: startCol,
    });
  }

  private handleNumber(): void {
    const start = this.i;
    const startCol = this.column;

    while (!this.isAtEnd() && /\d/.test(this.input[this.i] as string)) {
      this.i++;
      this.column++;
    }
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

  private handleIdentifierOrKeyword(): void {
    const start = this.i;
    const startCol = this.column;

    while (
      !this.isAtEnd() &&
      /[a-zA-Z0-9_]/.test(this.input[this.i] as string)
    ) {
      this.i++;
      this.column++;
    }

    const value = this.input.substring(start, this.i);

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

export function analyze(input: string): Token[] {
  const lexer = new LexicalAnalyzer(input);
  return lexer.tokenize();
}
