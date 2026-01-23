import { TokenStream } from "./helpers";
import { ErrorHandler } from "./error";
import { Identifier, TokenType, ASTNodeType } from "@/types";

export class PrimaryParser {
  constructor(
    private tokens: TokenStream,
    private errHandler: ErrorHandler,
  ) {}

  // Parses identifiers including 'sheet' (this) and 'under' (super)
  public parseIdentifier(): Identifier {
    if (this.tokens.check(TokenType.SHEET)) {
      const token = this.tokens.advance();
      return {
        type: ASTNodeType.IDENTIFIER,
        name: token.value,
        line: token.line,
        column: token.column,
      };
    }

    if (this.tokens.check(TokenType.UNDER)) {
      const token = this.tokens.advance();
      return {
        type: ASTNodeType.IDENTIFIER,
        name: token.value,
        line: token.line,
        column: token.column,
      };
    }

    const token = this.tokens.consume(
      TokenType.IDENTIFIER,
      "Expected identifier",
    );
    if (!token) {
      throw new Error("Missing identifier");
    }

    return {
      type: ASTNodeType.IDENTIFIER,
      name: token.value,
      line: token.line,
      column: token.column,
    };
  }
}
