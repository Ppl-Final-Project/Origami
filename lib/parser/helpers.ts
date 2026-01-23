import { TokenType, Token } from "@/types";
import { ErrorHandler } from "./error";

export interface ParserDebugConfig {
  enabled: boolean;
  maxStalls: number;
}

export class TokenStream {
  private current: number = 0;
  private debugConfig: ParserDebugConfig = {
    enabled: false,
    maxStalls: 5,
  };
  private debugParams = {
    lastIndex: -1,
    stallCount: 0,
  };

  constructor(
    private tokens: Token[],
    private errHandler: ErrorHandler,
    debugConfig?: ParserDebugConfig,
  ) {
    if (debugConfig) {
      this.debugConfig = debugConfig;
    }
  }

  // Detects infinite loops during parsing (debug mode)
  public checkProgress(context: string) {
    if (!this.debugConfig.enabled) return;

    if (this.current === this.debugParams.lastIndex) {
      this.debugParams.stallCount++;

      if (this.debugParams.stallCount >= this.debugConfig.maxStalls) {
        throw new Error(
          `[STALLED] Parser stalled at token index ${this.current} (${this.peek().value}) \n` +
            `Stalled at context: ${context}`,
        );
      }
    } else {
      this.debugParams.stallCount = 0;
    }

    this.debugParams.lastIndex = this.current;
  }

  public peek(): Token {
    return this.tokens[this.current];
  }

  public advance(): Token {
    const token = this.tokens[this.current++];

    if (this.debugConfig.enabled) {
      console.log(
        `[ADVANCE] ${token.type} '${token.value} @ ${token.line}:${token.column}'`,
      );
    }

    return token;
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

  // Expects and advances a specific token type, or logs error and synchronizes
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

    this.synchronize();
    return null;
  }

  // Recovers from parse errors by skipping to next statement boundary
  public synchronize(): void {
    if (this.isAtEnd()) return;
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;
      if (this.startsWithType() || this.check(TokenType.IDENTIFIER)) return;
      this.advance();
    }
  }

  // Checks if current token starts a type declaration (built-in or class type)
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

    if (typeTokens.some((type) => this.check(type))) return true;

    // Class type: IDENTIFIER followed by IDENTIFIER, '?', or '['
    if (this.check(TokenType.IDENTIFIER)) {
      const next = this.peekAhead(1);
      if (
        next?.type === TokenType.IDENTIFIER ||
        next?.type === TokenType.QUESTION ||
        next?.type === TokenType.LBRACKET
      ) {
        return true;
      }
    }

    return false;
  }
}
