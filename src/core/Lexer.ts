enum TokenCategory {
  PRIMITIVE = "PRIMITIVE_DATA",
  CONDITIONAL = "CONDITIONAL_STATEMENT",
  LOOP = "LOOP",
  JUMP = "JUMP STATEMENT",
  EXCEPTION = "EXCEPTION_HANDLING",
  STRUCTURE = "STRUCTURE",
  VARIABLE = "VARIABLE_MODIFIER",
  VALUE = "VALUE",
  IDENTIFIER = "IDENTIFIER",
  NUMBER = "NUMBER",
  OPERATOR = "OPERATOR",
  PUNCTUATION = "PUNCTUATION",
  STRING = "STRING",
  WHITESPACE = "WHITESPACE",
  COMMENT = "COMMENT",
  UNKNOWN = "UNKNOWN",
}

type TokenType =

  | TokenCategory.PRIMITIVE
  | TokenCategory.CONDITIONAL
  | TokenCategory.LOOP
  | TokenCategory.JUMP
  | TokenCategory.EXCEPTION
  | TokenCategory. STRUCTURE
  | TokenCategory.VARIABLE
  | TokenCategory.VALUE
  | TokenCategory.IDENTIFIER
  | TokenCategory.NUMBER
  | TokenCategory.OPERATOR
  | TokenCategory.PUNCTUATION
  | TokenCategory.STRING
  | TokenCategory.WHITESPACE
  | TokenCategory.COMMENT
  | TokenCategory.UNKNOWN;

interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

const KEYWORDS: Record<string, TokenCategory>= {
  "corner": TokenCategory.PRIMITIVE,
  "mark": TokenCategory.PRIMITIVE,
  "grain": TokenCategory.PRIMITIVE,
  "bend": TokenCategory.PRIMITIVE,
  "crease": TokenCategory.PRIMITIVE,
  "flat": TokenCategory.PRIMITIVE,

  "pattern": TokenCategory.CONDITIONAL,
  "center": TokenCategory.CONDITIONAL,
  "valley": TokenCategory.CONDITIONAL,
  "mountain": TokenCategory.CONDITIONAL,
  "isolate": TokenCategory.CONDITIONAL,

  "crimp": TokenCategory.LOOP,
  "pleat": TokenCategory.LOOP,
  "spiral": TokenCategory.LOOP,

  "tear": TokenCategory.JUMP,
  "flip": TokenCategory.JUMP,
  "unfold": TokenCategory.JUMP,

  "smooth": TokenCategory.EXCEPTION,
  "crumple": TokenCategory.EXCEPTION,
  "draft": TokenCategory.EXCEPTION,

  "builds": TokenCategory.STRUCTURE,
  "craft": TokenCategory.STRUCTURE,
  "fold": TokenCategory.STRUCTURE,
  "open": TokenCategory.STRUCTURE,
  "sharp": TokenCategory.STRUCTURE,
  "under": TokenCategory.STRUCTURE,
  "sheet": TokenCategory.STRUCTURE,

  "sealed": TokenCategory.VARIABLE,

  "blank": TokenCategory.VALUE,
  "aligned": TokenCategory.VALUE,
  "misaligned": TokenCategory.VALUE,
};
const OPERATORS = new Set([
  // Arithmetic Operators
  "+",
  "-",
  "*",
  "/",
  "%",
  "**",
  "++",
  "--",

  // Assignment Operators
  "=",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "**=",

  // Comparison Operators
  "==",
  "!=",
  "<",
  ">",
  "<=",
  ">=",

  // Logical Operators
  "&&",
  "||",
  "!",
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

      // Whitespace
      if (/\s/.test(currentChar)) {
        this.handleWhitespace();
        continue;
      }

      // Comment
      if (currentChar === "/" && this.peek(1) === "/") {
        this.handleComment();
        continue;
      }

      // Strings
      if (currentChar === '"' || currentChar === "'") {
        this.handleString(currentChar);
        continue;
      }

      // Numbers
      if (/\d/.test(currentChar)) {
        this.handleNumber();
        continue;
      }

      // Identifiers and keywords
      if (/[a-zA-Z_]/.test(currentChar)) {
        this.handleIdentifierOrKeyword();
        continue;
      }

      // Operators
      const twoChar = this.input.substring(this.i, this.i + 2);
      if (OPERATORS.has(twoChar)) {
        this.tokens.push({
          type: TokenCategory.OPERATOR,
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
          type: TokenCategory.OPERATOR,
          value: currentChar,
          line: this.line,
          column: this.column,
        });
        this.i++;
        this.column++;
        continue;
      }

      // Punctuations
      if (PUNCTUATIONS.has(currentChar)) {
        this.tokens.push({
          type: TokenCategory.PUNCTUATION,
          value: currentChar,
          line: this.line,
          column: this.column,
        });
        this.i++;
        this.column++;
        continue;
      }

      this.tokens.push({
        type: TokenCategory.UNKNOWN,
        value: currentChar,
        line: this.line,
        column: this.column,
      });
      this.i++;
      this.column++;
    }

    return this.tokens;
  }

  private handleWhitespace(): void {
    const start = this.i;
    const startCol = this.column;
    while (!this.isAtEnd() && /\s/.test(this.input[this.i] as string)) {
      if (this.input[this.i] === "\n") {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      this.i++;
    }

    this.tokens.push({
      type: TokenCategory.WHITESPACE,
      value: this.input.substring(start, this.i),
      line: this.line,
      column: startCol,
    });
  }

  private handleComment(): void {
    const start = this.i;
    const startCol = this.column;

    while (!this.isAtEnd() && this.input[this.i] !== "\n") {
      this.i++;
      this.column++;
    }

    this.tokens.push({
      type: TokenCategory.COMMENT,
      value: this.input.substring(start, this.i),
      line: this.line,
      column: startCol,
    });
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
      type: TokenCategory.STRING,
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
      type: TokenCategory.NUMBER,
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
    const type = KEYWORDS[value] ||TokenCategory.IDENTIFIER;
    this.tokens.push({
      type: type,
      value: value,
      line: this.line,
      column: startCol,
    });
  }
}

export default LexicalAnalyzer;
