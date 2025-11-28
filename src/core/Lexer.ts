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
  FUNCTION = "FUNCTION",
  WHITESPACE = "WHITESPACE",
  COMMENT = "COMMENT",
  UNKNOWN = "UNKNOWN",
  UNKNOWN_IDENTIFIER = "UNKNOWN_IDENTIFIER",
}

type TokenType =

  | TokenCategory.PRIMITIVE
  | TokenCategory.CONDITIONAL
  | TokenCategory.LOOP
  | TokenCategory.JUMP
  | TokenCategory.EXCEPTION
  | TokenCategory.STRUCTURE
  | TokenCategory.VARIABLE
  | TokenCategory.VALUE
  | TokenCategory.FUNCTION
  | TokenCategory.IDENTIFIER
  | TokenCategory.NUMBER
  | TokenCategory.OPERATOR
  | TokenCategory.PUNCTUATION
  | TokenCategory.STRING
  | TokenCategory.FUNCTION
  | TokenCategory.WHITESPACE
  | TokenCategory.COMMENT
  | TokenCategory.UNKNOWN
  | TokenCategory.UNKNOWN_IDENTIFIER;

interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

const KEYWORDS: Record<string, TokenCategory>= {
  "edge": TokenCategory.PRIMITIVE,
  "mark": TokenCategory.PRIMITIVE,
  "thick": TokenCategory.PRIMITIVE,
  "thin": TokenCategory.PRIMITIVE,
  "crease": TokenCategory.PRIMITIVE,
  "flat": TokenCategory.PRIMITIVE,

  "figure": TokenCategory.CONDITIONAL,
  "center": TokenCategory.CONDITIONAL,
  "back": TokenCategory.CONDITIONAL,
  "front": TokenCategory.CONDITIONAL,
  "isolate": TokenCategory.CONDITIONAL,

  "work": TokenCategory.LOOP,
  "layer": TokenCategory.LOOP,
  "spiral": TokenCategory.LOOP,

  "tear": TokenCategory.JUMP,
  "flip": TokenCategory.JUMP,
  "reveal": TokenCategory.JUMP,

  "smooth": TokenCategory.EXCEPTION,
  "crumple": TokenCategory.EXCEPTION,
  "draft": TokenCategory.EXCEPTION,

  "craft": TokenCategory.STRUCTURE,
  "fold": TokenCategory.STRUCTURE,
  "open": TokenCategory.STRUCTURE,
  "inherit": TokenCategory.STRUCTURE,
  "under": TokenCategory.STRUCTURE,
  "sheet": TokenCategory.STRUCTURE,
  "guide": TokenCategory.STRUCTURE,

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

      // Whitespace
      if (/\s/.test(currentChar)) {
        this.skipWhitespace();
        continue;
      }

      // Comment
      if (currentChar === "/" && this.peek(1) === "/") {
        this.handleComment();
        continue;
      }

      // Strings (support backtick template strings)
      if (currentChar === '"' || currentChar === "'" || currentChar === '`') {
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

    // Consume identifier characters (letters, digits, underscore)
    while (
      !this.isAtEnd() &&
      /[a-zA-Z0-9_]/.test(this.input[this.i] as string)
    ) {
      this.i++;
      this.column++;
    }

    const value = this.input.substring(start, this.i);

    // If it's a keyword, keep keyword category
    if (KEYWORDS[value]) {
      this.tokens.push({
        type: KEYWORDS[value],
        value,
        line: this.line,
        column: startCol,
      });
      return;
    }

    // Validation rules for identifiers
    // - Must start with a letter
    // - If length >= 2, second char must be letter or digit
    // - After second char, allowed: letter, digit, underscore
    // - Cannot begin or end with underscore
    // - No characters other than [A-Za-z0-9_]
    const raw = value;
    const invalidChar = /[^A-Za-z0-9_]/.test(raw);
    const startsWithLetter = /^[A-Za-z]/.test(raw);
    const secondCharValid = raw.length < 2 || /^[A-Za-z0-9]$/.test(raw[1]);
    const startsOrEndsWithUnderscore = /^_|_$/.test(raw);

    if (invalidChar || !startsWithLetter || !secondCharValid || startsOrEndsWithUnderscore) {
      this.tokens.push({
        type: TokenCategory.UNKNOWN_IDENTIFIER,
        value: raw,
        line: this.line,
        column: startCol,
      });
      return;
    }

    // Function/module naming rule (applies when identifier starts with UPPERCASE):
    // - ALL UPPERCASE letters and digits
    // - no underscore
    // - must end with a digit (at least one)
    // Example: BUILD1, MODULE2
    const isFunction = /^[A-Z0-9]+$/.test(raw) && /\d$/.test(raw) && !raw.includes("_") && /[A-Z]/.test(raw);

    // Variable naming: must start with a lowercase letter, then letters/digits/underscore allowed
    const variablePattern = /^[a-z][A-Za-z0-9_]*$/;

    // Enforce structural rule: identifiers that start with uppercase must follow function rules
    if (/^[A-Z]/.test(raw)) {
      if (isFunction) {
        this.tokens.push({
          type: TokenCategory.FUNCTION,
          value: raw,
          line: this.line,
          column: startCol,
        });
        return;
      }
      // Uppercase-start but not a valid function name -> unknown identifier
      this.tokens.push({
        type: TokenCategory.UNKNOWN_IDENTIFIER,
        value: raw,
        line: this.line,
        column: startCol,
      });
      return;
    }

    // Lowercase-start identifiers are variables
    if (variablePattern.test(raw)) {
      this.tokens.push({
        type: TokenCategory.IDENTIFIER,
        value: raw,
        line: this.line,
        column: startCol,
      });
      return;
    }

    // Fallback: unknown identifier format
    this.tokens.push({
      type: TokenCategory.UNKNOWN_IDENTIFIER,
      value: raw,
      line: this.line,
      column: startCol,
    });
  }
}

export default LexicalAnalyzer;