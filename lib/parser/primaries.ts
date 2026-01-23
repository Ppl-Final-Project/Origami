import { TokenStream } from "./helpers";
import { ErrorHandler } from "./error";
import { Identifier, TokenType, ASTNodeType, InputMethodCall } from "@/types";

export class PrimaryParser {
  constructor(
    private tokens: TokenStream,
    private errHandler: ErrorHandler,
  ) {}

  public parseIdentifier(): Identifier {
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

  public parseInputMethodCall(): InputMethodCall {
    const objectToken = this.tokens.peek();
    const object = this.parseIdentifier();

    this.tokens.consume(TokenType.DOT, "Expected '.' in input method call");

    const methodToken = this.tokens.consume(
      TokenType.IDENTIFIER,
      "Expected method name after '.'",
    );
    if (!methodToken) {
      throw new Error("Missing method name");
    }

    const method = methodToken.value;

    // Validate the input method name
    const validMethods = [
      "next",
      "nextStrip",
      "nextCrease",
      "nextThick",
      "nextThin",
      "nextEdge",
      "nextMark",
    ];
    if (!validMethods.includes(method)) {
      this.errHandler.addError({
        line: methodToken.line,
        column: methodToken.column,
        message: `Invalid input method '${method}'. Expected one of: ${validMethods.join(", ")}`,
        length: method.length,
        severity: "error",
      });
    }

    this.tokens.consume(TokenType.LPAREN, "Expected '(' after method name");
    this.tokens.consume(TokenType.RPAREN, "Expected ')' after '('");

    return {
      type: ASTNodeType.INPUT_METHOD_CALL,
      object,
      method,
      line: objectToken.line,
      column: objectToken.column,
    };
  }
}
