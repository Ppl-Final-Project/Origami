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
    return this.parseLogical();
  }

  parseLogical(): Expression {
    let left = this.parseRelational();

    while (this.tokens.match(TokenType.AND, TokenType.OR)) {
      const operator = this.tokens.advance();
      const right = this.parseRelational();
      left = {
        type: ASTNodeType.BINARY_EXPRESSION,
        operator: operator.value,
        left,
        right,
        line: operator.line,
        column: operator.column,
      };
    }

    return left;
  }

  parseRelational(): Expression {
    let left = this.parseAdditive();

    while (
      this.tokens.match(
        TokenType.EQUAL,
        TokenType.NOT_EQUAL,
        TokenType.LESS_THAN,
        TokenType.GREATER_THAN,
        TokenType.LESS_EQUAL,
        TokenType.GREATER_EQUAL,
      )
    ) {
      const operator = this.tokens.advance();
      const right = this.parseAdditive();
      left = {
        type: ASTNodeType.BINARY_EXPRESSION,
        operator: operator.value,
        left,
        right,
        line: operator.line,
        column: operator.column,
      };
    }

    return left;
  }

  parseAdditive() {
    let left = this.parseMultiplicative();

    while (
      this.tokens.check(TokenType.PLUS) ||
      this.tokens.check(TokenType.MINUS)
    ) {
      const operatorToken = this.tokens.advance();
      const right = this.parseMultiplicative();

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

  parseMultiplicative(): Expression {
    let left = this.parseUnary();

    while (
      this.tokens.check(TokenType.MULTIPLY) ||
      this.tokens.check(TokenType.DIVIDE) ||
      this.tokens.check(TokenType.MODULO)
    ) {
      const operatorToken = this.tokens.advance();
      const right = this.parsePrimary();

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

  parseUnary(): Expression {
    if (this.tokens.match(TokenType.PLUS, TokenType.MINUS, TokenType.NOT)) {
      const operator = this.tokens.advance();
      const operand = this.parseUnary();

      return {
        type: ASTNodeType.UNARY_EXPRESSION,
        operator: operator.value,
        expr: operand,
        line: operator.line,
        column: operator.column,
      };
    }

    if (this.tokens.match(TokenType.INCREMENT, TokenType.DECREMENT)) {
      const op = this.tokens.advance();
      const operand = this.parseUnary();
      return {
        type: ASTNodeType.PREFIX,
        operator: op.value,
        expr: operand,
        line: op.line,
        column: op.column,
      };
    }

    return this.parsePostfix();
  }

  parsePostfix(): Expression {
    let expr = this.parsePrimary(); // parse identifier, literal, etc.

    while (this.tokens.match(TokenType.INCREMENT, TokenType.DECREMENT)) {
      const opToken = this.tokens.advance();
      expr = {
        type: ASTNodeType.POSTFIX,
        expr,
        operator: opToken.value, // "++" or "--"
        line: opToken.line,
        column: opToken.column,
      };
    }

    return expr;
  }

  parsePrimary(): Expression {
    if (this.tokens.check(TokenType.LPAREN)) {
      return this.parseGrouping();
    }

    if (
      this.tokens.check(TokenType.NUMBER) ||
      this.tokens.check(TokenType.STRING)
    ) {
      return this.parseLiteral();
    }

    if (this.tokens.check(TokenType.IDENTIFIER)) {
      return this.parseMethodCall();
    }

    return this.reportExpressionError();
  }

  parseGrouping() {
    this.tokens.consume(TokenType.LPAREN, "Expected '('.");
    const expr = this.parseExpression();
    this.tokens.consume(TokenType.RPAREN, "Expected ')' after expression.");
    return expr;
  }

  parseMethodCall(): Expression {
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

  parseLiteral(): Expression {
    const token = this.tokens.advance();
    return {
      type: ASTNodeType.LITERAL,
      value:
        token.type === TokenType.NUMBER ? parseFloat(token.value) : token.value,
      raw: token.value,
      line: token.line,
      column: token.column,
    };
  }

  reportExpressionError(): Expression {
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
    this.tokens.synchronize();
    return {
      type: ASTNodeType.IDENTIFIER,
      name: token.value,
      line: token.line,
      column: token.column,
    };
  }
}
