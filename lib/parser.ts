import { Token, TokenType, ParseError, ParseResult } from "@/types";

// Parses tokens from the lexer to perform syntax analysis

class Parser {
  private tokens: Token[];
  private current: number = 0;
  private errors: ParseError[] = [];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  // Initiates syntax analysis
  parse(): ParseResult {
    this.current = 0;
    this.errors = [];

    try {
      // TODO: Implement parsing logic
      // For now, just check if we have tokens
      if (this.tokens.length === 0) {
        return {
          success: true,
          errors: [],
          ast: null,
        };
      }

      // Placeholder: Parse program structure
      this.parseProgram();

      return {
        success: this.errors.length === 0,
        errors: this.errors,
        ast: null, // TODO: Return actual AST
      };
    } catch (error) {
      // Handle unexpected errors
      this.addError({
        line: this.peek()?.line || 1,
        column: this.peek()?.column || 1,
        message: `Unexpected error during parsing: ${error}`,
        length: 1,
        severity: "error",
      });

      return {
        success: false,
        errors: this.errors,
        ast: null,
      };
    }
  }

  // Parses the program based on grammar rules
  private parseProgram(): void {
    // Placeholder implementation
    while (!this.isAtEnd()) {
      // TODO: Parse statements, declarations, etc.
      this.advance();
    }
  }

  // Adds a parse error.
  private addError(error: ParseError): void {
    this.errors.push(error);
  }

  // Checks if the current token matches the expected type
  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  // Consumes the current token if it matches, otherwise adds an error
  private consume(type: TokenType, message: string): Token | null {
    if (this.check(type)) {
      return this.advance();
    }

    const token = this.peek();
    this.addError({
      line: token.line,
      column: token.column,
      message: message,
      expected: type,
      found: token.type,
      length: token.value.length,
      severity: "error",
    });

    return null;
  }

  // Advances to the next token
  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  // Checks if the end of the token stream has been reached
  private isAtEnd(): boolean {
    return (
      this.current >= this.tokens.length || this.peek().type === TokenType.EOF
    );
  }

  // Returns the current token without advancing
  private peek(): Token {
    return this.tokens[this.current] || this.tokens[this.tokens.length - 1];
  }

  // Returns the previous token
  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  // Looks ahead by n tokens
  private peekAhead(n: number): Token | null {
    const index = this.current + n;
    if (index >= this.tokens.length) return null;
    return this.tokens[index];
  }
}

// Parses a list of tokens
export function parse(tokens: Token[]): ParseResult {
  const parser = new Parser(tokens);
  return parser.parse();
}
