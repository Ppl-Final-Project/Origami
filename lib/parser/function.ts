import {
  Statement,
  TokenType,
  ASTNodeType,
  Expression,
  FunctionDeclaration,
  FunctionAttachment,
  Parameter,
} from "@/types";
import { TokenStream } from "./helpers";
import { ErrorHandler } from "./error";
import { ExpressionParser } from "./expression";

export class FunctionParser {
  constructor(
    private stream: TokenStream,
    private errHandler: ErrorHandler,
    private expressionParser: ExpressionParser,
    private parseBlock: () => Statement[],
  ) {}

  // type [?] name(params) [attach fn()] fold...unfold
  startsWithFunction(): boolean {
    if (!this.stream.startsWithType()) return false;

    let offset = 1;

    // Check for nullable: type?
    if (this.stream.peekAhead(1)?.type === TokenType.QUESTION) {
      offset = 2;
    }

    const identToken = this.stream.peekAhead(offset);
    if (!identToken || identToken.type !== TokenType.IDENTIFIER) return false;

    const nextToken = this.stream.peekAhead(offset + 1);
    // Function can start with '(' for regular functions or 'attach' for attached functions
    return (
      nextToken?.type === TokenType.LPAREN ||
      nextToken?.type === TokenType.ATTACH
    );
  }

  parseFunctionDeclaration(): FunctionDeclaration {
    const startToken = this.stream.peek();
    const returnTypeToken = this.stream.advance();
    const returnType = returnTypeToken.value;

    let isNullable = false;
    if (this.stream.check(TokenType.QUESTION)) {
      this.stream.advance();
      isNullable = true;
    }

    const nameToken = this.stream.consume(
      TokenType.IDENTIFIER,
      "Expected function name",
    );
    const name = nameToken?.value || "unknownFunction";

    let parameters: Parameter[] = [];
    let attachment: FunctionAttachment | undefined;

    if (this.stream.check(TokenType.ATTACH)) {
      attachment = this.parseAttachment();
    } else {
      this.stream.consume(TokenType.LPAREN, "Expected '(' after function name");
      parameters = this.parseParameters();
      this.stream.consume(TokenType.RPAREN, "Expected ')' after parameters");

      if (this.stream.check(TokenType.ATTACH)) {
        attachment = this.parseAttachment();
      }
    }

    const body = this.parseBlock();

    return {
      type: ASTNodeType.FUNCTION_DECLARATION,
      returnType,
      isNullable,
      name,
      parameters,
      body,
      attachment,
      line: startToken.line,
      column: startToken.column,
    };
  }

  parseParameters(): Parameter[] {
    const parameters: Parameter[] = [];

    if (this.stream.check(TokenType.RPAREN)) {
      return parameters;
    }

    do {
      const paramStart = this.stream.peek();

      if (!this.stream.startsWithType()) {
        this.errHandler.addError({
          line: this.stream.peek().line,
          column: this.stream.peek().column,
          message: "Expected parameter type",
          length: 1,
          severity: "error",
        });
        break;
      }

      const typeToken = this.stream.advance();
      const dataType = typeToken.value;

      let isNullable = false;
      if (this.stream.check(TokenType.QUESTION)) {
        this.stream.advance();
        isNullable = true;
      }

      let isArray = false;
      if (this.stream.check(TokenType.LBRACKET)) {
        this.stream.advance();
        this.stream.consume(TokenType.RBRACKET, "Expected ']' after '['");
        isArray = true;
      }

      const nameToken = this.stream.consume(
        TokenType.IDENTIFIER,
        "Expected parameter name",
      );
      const paramName = nameToken?.value || "unknownParam";

      let defaultValue: Expression | undefined;
      if (this.stream.check(TokenType.ASSIGN)) {
        this.stream.advance();
        defaultValue = this.expressionParser.parseExpression();
      }

      parameters.push({
        type: ASTNodeType.PARAMETER,
        dataType,
        name: paramName,
        isArray,
        isNullable,
        defaultValue,
        line: paramStart.line,
        column: paramStart.column,
      });

      if (!this.stream.check(TokenType.COMMA)) break;
      this.stream.advance();
    } while (!this.stream.check(TokenType.RPAREN) && !this.stream.isAtEnd());

    return parameters;
  }

  // attach funcName(args)
  private parseAttachment(): FunctionAttachment {
    const startToken = this.stream.advance(); // consume 'attach'

    const funcNameToken = this.stream.consume(
      TokenType.IDENTIFIER,
      "Expected function name after 'attach'",
    );
    const functionName = funcNameToken?.value || "unknownFunction";

    this.stream.consume(
      TokenType.LPAREN,
      "Expected '(' after attached function name",
    );

    const args: Expression[] = [];
    if (!this.stream.check(TokenType.RPAREN)) {
      do {
        args.push(this.expressionParser.parseExpression());
      } while (this.stream.match(TokenType.COMMA) && this.stream.advance());
    }

    this.stream.consume(TokenType.RPAREN, "Expected ')' after arguments");

    return {
      type: ASTNodeType.FUNCTION_ATTACHMENT,
      functionName,
      arguments: args,
      line: startToken.line,
      column: startToken.column,
    };
  }
}
