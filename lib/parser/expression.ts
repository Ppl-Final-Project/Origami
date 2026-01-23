import { TokenType, ASTNodeType, Expression } from "@/types";
import { ErrorHandler } from "./error";
import { TokenStream } from "./helpers";
import { PrimaryParser } from "./primaries";

export class ExpressionParser {
  constructor(
    private tokens: TokenStream,
    private errHandler: ErrorHandler,
    private primaryParser: PrimaryParser,
  ) {}
  parseExpression() {
    let left = this.parseTerm();

    while (
      this.tokens.check(TokenType.PLUS) ||
      this.tokens.check(TokenType.MINUS)
    ) {
      const operatorToken = this.tokens.advance();
      const right = this.parseTerm();

      left = {
        type: ASTNodeType.BINARY_EXPRESSION,
        operator: operatorToken.value,
        left,
        right,
        line: operatorToken.line,
        column: operatorToken.column,
      };
    }

    return left;
  }

  private parseTerm(): Expression {
    let left = this.parseFactor();

    while (
      this.tokens.check(TokenType.MULTIPLY) ||
      this.tokens.check(TokenType.DIVIDE) ||
      this.tokens.check(TokenType.MODULO)
    ) {
      const operatorToken = this.tokens.advance();
      const right = this.parseFactor();

      left = {
        type: ASTNodeType.BINARY_EXPRESSION,
        operator: operatorToken.value,
        left,
        right,
        line: operatorToken.line,
        column: operatorToken.column,
      };
    }

    return left;
  }

  // Parses a factor (the highest-precedence expression)
  private parseFactor(): Expression {
    // Parenthesized expression
    if (this.tokens.check(TokenType.LPAREN)) {
      this.tokens.advance(); // consume (
      const expr = this.parseExpression();
      this.tokens.consume(TokenType.RPAREN, "Expected ')' after expression");
      return expr;
    }

    // Literal (number or string)
    if (
      this.tokens.check(TokenType.NUMBER) ||
      this.tokens.check(TokenType.STRING)
    ) {
      return this.parseLiteral();
    }

    // Identifier or an input method call
    if (this.tokens.check(TokenType.IDENTIFIER)) {
      const identifier = this.primaryParser.parseIdentifier();

      // Check for an input method call
      if (this.tokens.check(TokenType.DOT)) {
        this.tokens.advance(); // consume .

        const methodToken = this.tokens.consume(
          TokenType.IDENTIFIER,
          "Expected method name after '.'",
        );
        if (!methodToken) {
          throw new Error("Missing method name");
        }

        this.tokens.consume(TokenType.LPAREN, "Expected '(' after method name");
        this.tokens.consume(TokenType.RPAREN, "Expected ')' after '('");

        return {
          type: ASTNodeType.INPUT_METHOD_CALL,
          object: identifier,
          method: methodToken.value,
          line: identifier.line,
          column: identifier.column,
        };
      }

      return identifier;
    }

    // Handle unexpected tokens in an expression
    const token = this.tokens.peek();
    this.errHandler.addError({
      line: token.line,
      column: token.column,
      message: `Unexpected token '${token.value}' in expression`,
      length: token.value.length,
      severity: "error",
    });

    // Return a dummy identifier to allow parsing to continue
    this.tokens.advance();
    return {
      type: ASTNodeType.IDENTIFIER,
      name: token.value,
      line: token.line,
      column: token.column,
    };
  }

  parseLiteral(): Expression {
    const token = this.tokens.advance();
    return {
      type: ASTNodeType.LITERAL,
      value: this.tokens.check(TokenType.NUMBER)
        ? parseFloat(token.value)
        : token.value,
      raw: token.value,
      line: token.line,
      column: token.column,
    };
  }
}
