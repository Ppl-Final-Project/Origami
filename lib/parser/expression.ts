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

  // Entry point: parses any expression (lowest precedence first)
  parseExpression(): Expression {
    return this.parseLogical();
  }

  // Logical: and, or (lowest precedence)
  private parseLogical(): Expression {
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

  // Relational: ==, !=, <, >, <=, >=
  private parseRelational(): Expression {
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

  // Additive: +, -
  private parseAdditive(): Expression {
    let left = this.parseMultiplicative();

    while (
      this.tokens.check(TokenType.PLUS) ||
      this.tokens.check(TokenType.MINUS)
    ) {
      const operator = this.tokens.advance();
      const right = this.parseMultiplicative();
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

  // Multiplicative: *, /, %
  private parseMultiplicative(): Expression {
    let left = this.parseUnary();

    while (
      this.tokens.check(TokenType.MULTIPLY) ||
      this.tokens.check(TokenType.DIVIDE) ||
      this.tokens.check(TokenType.MODULO)
    ) {
      const operator = this.tokens.advance();
      const right = this.parseUnary();
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

  // Unary: +, -, !, ++, -- (prefix)
  private parseUnary(): Expression {
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

  // Postfix: ++, --
  private parsePostfix(): Expression {
    let expr = this.parseCallOrMember();

    while (this.tokens.match(TokenType.INCREMENT, TokenType.DECREMENT)) {
      const op = this.tokens.advance();
      expr = {
        type: ASTNodeType.POSTFIX,
        expr,
        operator: op.value,
        line: op.line,
        column: op.column,
      };
    }

    return expr;
  }

  // Member access (.), calls (), and arrow expressions (->)
  private parseCallOrMember(): Expression {
    let expr = this.parsePrimary();

    while (true) {
      if (this.tokens.check(TokenType.DOT)) {
        this.tokens.advance();
        const property = this.tokens.consume(
          TokenType.IDENTIFIER,
          "Expected property name after '.'",
        );

        expr = {
          type: ASTNodeType.MEMBER_EXPRESSION,
          object: expr,
          property: {
            type: ASTNodeType.IDENTIFIER,
            name: property?.value || "unknown",
            line: property?.line || expr.line,
            column: property?.column || expr.column,
          },
          line: expr.line,
          column: expr.column,
        };
      } else if (this.tokens.check(TokenType.LPAREN)) {
        expr = this.parseCallExpression(expr);
      } else if (this.tokens.check(TokenType.ARROW)) {
        this.tokens.advance();
        let right;
        if (this.tokens.check(TokenType.OUT)) {
          right = this.tokens.advance();
        } else {
          right = this.tokens.consume(
            TokenType.IDENTIFIER,
            "Expected identifier after '->'",
          );
        }

        return {
          type: ASTNodeType.ARROW_EXPRESSION,
          left: expr as any,
          right: {
            type: ASTNodeType.IDENTIFIER,
            name: right?.value || "out",
            line: right?.line || expr.line,
            column: right?.column || expr.column,
          },
          line: expr.line,
          column: expr.column,
        };
      } else {
        break;
      }
    }

    return expr;
  }

  private parseCallExpression(callee: Expression): Expression {
    this.tokens.advance(); // consume (
    const args = this.parseArguments();
    this.tokens.consume(TokenType.RPAREN, "Expected ')' after arguments");

    return {
      type: ASTNodeType.CALL_EXPRESSION,
      callee,
      arguments: args,
      line: callee.line,
      column: callee.column,
    };
  }

  private parseArguments(): Expression[] {
    const args: Expression[] = [];

    if (!this.tokens.check(TokenType.RPAREN)) {
      do {
        args.push(this.parseExpression());
      } while (this.tokens.check(TokenType.COMMA) && this.tokens.advance());
    }

    return args;
  }

  // Primary: literals, identifiers, grouping, object instantiation
  private parsePrimary(): Expression {
    if (this.tokens.check(TokenType.LPAREN)) {
      this.tokens.advance();
      const expr = this.parseExpression();
      this.tokens.consume(TokenType.RPAREN, "Expected ')' after expression.");
      return expr;
    }

    if (this.tokens.check(TokenType.CRAFT)) return this.parseNewExpression();

    if (
      this.tokens.check(TokenType.NUMBER) ||
      this.tokens.check(TokenType.STRING)
    ) {
      return this.parseLiteral();
    }

    if (this.tokens.check(TokenType.TEMPLATE_LITERAL)) {
      return this.parseTemplateLiteral();
    }

    if (this.tokens.check(TokenType.BLANK)) {
      const token = this.tokens.advance();
      return {
        type: ASTNodeType.LITERAL,
        value: null,
        raw: "blank",
        line: token.line,
        column: token.column,
      };
    }

    if (
      this.tokens.check(TokenType.ALIGNED) ||
      this.tokens.check(TokenType.MISALIGNED)
    ) {
      const token = this.tokens.advance();
      return {
        type: ASTNodeType.LITERAL,
        value: token.type === TokenType.ALIGNED ? "aligned" : "misaligned",
        raw: token.value,
        line: token.line,
        column: token.column,
      };
    }

    if (
      this.tokens.check(TokenType.IDENTIFIER) ||
      this.tokens.check(TokenType.SHEET) ||
      this.tokens.check(TokenType.UNDER)
    ) {
      return this.primaryParser.parseIdentifier();
    }

    return this.reportError();
  }

  // Object instantiation: craft ClassName(args)
  private parseNewExpression(): Expression {
    const token = this.tokens.advance(); // consume 'craft'

    const classNameToken = this.tokens.consume(
      TokenType.IDENTIFIER,
      "Expected class name after 'craft'",
    );

    this.tokens.consume(TokenType.LPAREN, "Expected '(' after class name");
    const args = this.parseArguments();
    this.tokens.consume(TokenType.RPAREN, "Expected ')' after arguments");

    return {
      type: ASTNodeType.NEW_EXPRESSION,
      callee: {
        type: ASTNodeType.IDENTIFIER,
        name: classNameToken?.value || "Unknown",
        line: classNameToken?.line || token.line,
        column: classNameToken?.column || token.column,
      },
      arguments: args,
      line: token.line,
      column: token.column,
    };
  }

  private parseLiteral(): Expression {
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

  private parseTemplateLiteral(): Expression {
    const token = this.tokens.advance();
    const raw = token.value;
    const content = raw.slice(1, -1); // remove backticks

    const parts: (
      | Expression
      | {
          type: ASTNodeType.TEMPLATE_ELEMENT;
          value: string;
          raw: string;
          line: number;
          column: number;
        }
    )[] = [];

    let lastIndex = 0;
    const regex = /\$\{([^}]+)\}/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const text = content.slice(lastIndex, match.index);
        parts.push({
          type: ASTNodeType.TEMPLATE_ELEMENT,
          value: text,
          raw: text,
          line: token.line,
          column: token.column,
        });
      }

      // Interpolated expression as identifier (simplified)
      const exprName = match[1].trim();
      parts.push({
        type: ASTNodeType.IDENTIFIER,
        name: exprName,
        line: token.line,
        column: token.column,
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      const text = content.slice(lastIndex);
      parts.push({
        type: ASTNodeType.TEMPLATE_ELEMENT,
        value: text,
        raw: text,
        line: token.line,
        column: token.column,
      });
    }

    return {
      type: ASTNodeType.TEMPLATE_LITERAL,
      parts,
      line: token.line,
      column: token.column,
    };
  }

  private reportError(): Expression {
    const token = this.tokens.peek();
    this.errHandler.addError({
      line: token.line,
      column: token.column,
      message: `Unexpected token '${token.value}' in expression`,
      length: token.value.length,
      severity: "error",
    });

    this.tokens.synchronize();
    return {
      type: ASTNodeType.IDENTIFIER,
      name: token.value,
      line: token.line,
      column: token.column,
    };
  }
}
