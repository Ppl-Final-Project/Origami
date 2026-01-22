import { TokenType, Token } from "@/types";
import { ParserBase } from "./base";

export function HelperParserMixin<
  TBase extends new (...args: any[]) => ParserBase,
>(Base: TBase) {
  return class extends Base {
    protected peek(): Token {
      return this.tokens[this.current];
    }

    protected advance(): Token {
      return this.tokens[this.current++];
    }

    protected isAtEnd(): boolean {
      return this.peek().type === TokenType.EOF;
    }

    protected previous(): Token {
      return this.tokens[this.current - 1];
    }
    protected match(...types: TokenType[]): boolean {
      for (const t of types) {
        if (this.peek().type === t) {
          return true;
        }
      }
      return false;
    }
    protected check(type: TokenType): boolean {
      if (this.isAtEnd()) return false;
      return this.peek().type === type;
    }
    protected isType(): boolean {
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
    protected reset() {
      this.tokens = [];
      this.current = 0;
      this.errors = [];
    }
  };
}
