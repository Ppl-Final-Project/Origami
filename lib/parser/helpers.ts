import { TokenType, Token } from "@/types";
import { ParserBase } from "./base";
import { ErrorHandler } from "./error";

export class TokenStream {
  private current: number = 0;
  constructor(
    private tokens: Token[],
    private errHandler: ErrorHandler,
  ) {}

  public peek(): Token {
    return this.tokens[this.current];
  }

  public advance(): Token {
    return this.tokens[this.current++];
  }

  public isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  public previous(): Token {
    return this.tokens[this.current - 1];
  }
  public match(...types: TokenType[]): boolean {
    for (const t of types) {
      if (this.peek().type === t) {
        return true;
      }
    }
    return false;
  }
  public check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }
  public peekAhead(n: number): Token | null {
    const index = this.current + n;
    if (index >= this.tokens.length) return null;
    return this.tokens[index];
  }

  public consume(type: TokenType, message: string): Token | null {
    if (this.check(type)) {
      return this.advance();
    }

    const token = this.peek();
    this.errHandler.addError({
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
  public synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      // Stop at the end of a statement
      if (this.previous().type === TokenType.SEMICOLON) {
        return;
      }

      // Stop at the likely beginning of a new statement
      if (this.startsWithType() || this.check(TokenType.IDENTIFIER)) {
        return;
      }

      this.advance();
    }
  }
  public startsWithType(): boolean {
    const typeTokens = [
      TokenType.EDGE,
      TokenType.MARK,
      TokenType.THICK,
      TokenType.THIN,
      TokenType.CREASE,
      TokenType.FLAT,
      TokenType.STRIP,
    ];
    return typeTokens.some((type) => this.check(type));
  }
}
