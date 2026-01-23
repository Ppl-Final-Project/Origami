import { Statement, TokenType, Expression, ASTNodeType } from "@/types";
import { ExpressionParser } from "./expression";
import { TokenStream } from "./helpers";
import { StatementParser } from "./statement";

export class IteratorParser {
  constructor(
    private stream: TokenStream,
    private expressionParser: ExpressionParser,
    private statementParser: StatementParser,
  ) {}

  startsWithIterator(): boolean {
    return (
      this.stream.check(TokenType.WORK) ||
      this.stream.check(TokenType.SPIRAL) ||
      this.stream.check(TokenType.LAYER)
    );
  }

  parseIterator(): Statement {
    if (this.stream.check(TokenType.WORK)) return this.parseDoWhile();
    if (this.stream.check(TokenType.SPIRAL)) return this.parseWhile();
    if (this.stream.check(TokenType.LAYER)) return this.parseForOrForEach();

    throw new Error("Expected iterator statement");
  }

  // --------------------------------------------------
  // do { ... } while (expr);
  // --------------------------------------------------
  private parseDoWhile(): Statement {
    const start = this.stream.advance(); // work

    const body = this.statementParser.parseStatement();

    this.stream.consume(TokenType.SPIRAL, "Expected 'spiral' after do-body");
    this.stream.consume(TokenType.LPAREN, "Expected '('");

    const condition = this.expressionParser.parseExpression();

    this.stream.consume(TokenType.RPAREN, "Expected ')'");
    this.stream.consume(TokenType.SEMICOLON, "Expected ';'");

    return {
      type: ASTNodeType.DO_WHILE_STATEMENT,
      body,
      condition,
      line: start.line,
      column: start.column,
    };
  }

  // --------------------------------------------------
  // while (expr) stmt
  // --------------------------------------------------
  private parseWhile(): Statement {
    const start = this.stream.advance(); // spiral

    this.stream.consume(TokenType.LPAREN, "Expected '('");

    const condition = this.expressionParser.parseExpression();

    this.stream.consume(TokenType.RPAREN, "Expected ')'");
    const body = this.statementParser.parseStatement();

    return {
      type: ASTNodeType.WHILE_STATEMENT,
      condition,
      body,
      line: start.line,
      column: start.column,
    };
  }

  // --------------------------------------------------
  // for (...) OR foreach (...)
  // --------------------------------------------------
  private parseForOrForEach(): Statement {
    const start = this.stream.advance(); // layer
    this.stream.consume(TokenType.LPAREN, "Expected '('");

    // Lookahead for foreach: Type Identifier :
    if (
      this.stream.startsWithType() &&
      this.stream.peekAhead(2)?.type === TokenType.COLON
    ) {
      return this.parseForEach(start);
    }

    return this.parseFor(start);
  }

  // --------------------------------------------------
  // for(init; condition; update) stmt
  // --------------------------------------------------
  private parseFor(start: any): Statement {
    const init = !this.stream.check(TokenType.SEMICOLON)
      ? this.statementParser.parseStatement()
      : null;

    this.stream.consume(TokenType.SEMICOLON, "Expected ';'");

    const condition = !this.stream.check(TokenType.SEMICOLON)
      ? this.expressionParser.parseExpression()
      : null;

    this.stream.consume(TokenType.SEMICOLON, "Expected ';'");

    const updates: Expression[] = [];
    if (!this.stream.check(TokenType.RPAREN)) {
      do {
        updates.push(this.expressionParser.parseExpression());
      } while (this.stream.match(TokenType.COMMA) && this.stream.advance());
    }

    this.stream.consume(TokenType.RPAREN, "Expected ')'");
    const body = this.statementParser.parseStatement();

    return {
      type: ASTNodeType.FOR_STATEMENT,
      init,
      condition,
      update: updates,
      body,
      line: start.line,
      column: start.column,
    };
  }

  // --------------------------------------------------
  // foreach: for(Type id : expr) stmt
  // --------------------------------------------------
  private parseForEach(start: any): Statement {
    const typeToken = this.stream.advance();
    const idToken = this.stream.consume(
      TokenType.IDENTIFIER,
      "Expected identifier",
    );

    this.stream.consume(TokenType.COLON, "Expected ':'");

    const iterable = this.expressionParser.parseExpression();

    this.stream.consume(TokenType.RPAREN, "Expected ')'");
    const body = this.statementParser.parseStatement();

    return {
      type: ASTNodeType.FOREACH_STATEMENT,
      varType: typeToken.value,
      identifier: idToken!.value,
      iterable,
      body,
      line: start.line,
      column: start.column,
    };
  }
}
