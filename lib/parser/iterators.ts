import { Statement, TokenType, Expression, ASTNodeType, Token } from "@/types";
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

  // work fold...unfold spiral (cond);
  private parseDoWhile(): Statement {
    const start = this.stream.advance(); // work

    const body = this.statementParser.parseBlock();

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

  // spiral (cond) fold...unfold
  private parseWhile(): Statement {
    const start = this.stream.advance(); // spiral

    this.stream.consume(TokenType.LPAREN, "Expected '('");

    const condition = this.expressionParser.parseExpression();

    this.stream.consume(TokenType.RPAREN, "Expected ')'");
    const body = this.statementParser.parseBlock();

    return {
      type: ASTNodeType.WHILE_STATEMENT,
      condition,
      body,
      line: start.line,
      column: start.column,
    };
  }

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

    // Check for bounded iteration: layer (5) as i or layer (expr) as i
    // This is when the content after ( is NOT a type followed by identifier =
    // but is an expression followed by ) as identifier
    if (this.isBoundedIteration()) {
      return this.parseBoundedIteration(start);
    }

    return this.parseFor(start);
  }

  // Distinguishes bounded iteration (layer (n) as i) from for loop
  private isBoundedIteration(): boolean {
    let depth = 1;
    let offset = 0;

    while (depth > 0) {
      const token = this.stream.peekAhead(offset);
      if (!token || token.type === TokenType.EOF) return false;
      if (token.type === TokenType.LPAREN) depth++;
      if (token.type === TokenType.RPAREN) depth--;
      if (token.type === TokenType.SEMICOLON && depth > 0) return false;
      offset++;
    }

    const afterParen = this.stream.peekAhead(offset);
    return afterParen?.type === TokenType.AS;
  }

  // layer (count) as i fold...unfold
  private parseBoundedIteration(start: Token): Statement {
    const count = this.expressionParser.parseExpression();

    this.stream.consume(TokenType.RPAREN, "Expected ')' after count");
    this.stream.consume(
      TokenType.AS,
      "Expected 'as' after bounded iteration count",
    );

    const iteratorToken = this.stream.consume(
      TokenType.IDENTIFIER,
      "Expected iterator name after 'as'",
    );
    const iterator = iteratorToken?.value || "i";

    const body = this.statementParser.parseBlock();

    return {
      type: ASTNodeType.BOUNDED_ITERATION,
      count,
      iterator,
      body,
      line: start.line,
      column: start.column,
    };
  }

  // layer (init; cond; update) fold...unfold
  private parseFor(start: Token): Statement {
    let init: Statement | null = null;

    if (!this.stream.check(TokenType.SEMICOLON)) {
      if (this.stream.check(TokenType.CREASE)) {
        init = this.statementParser.parseVariableDeclaration(false);
      }
    }

    this.stream.consume(TokenType.SEMICOLON, "Expected ';'");

    const condition = !this.stream.check(TokenType.SEMICOLON)
      ? this.expressionParser.parseExpression()
      : null;

    this.stream.consume(TokenType.SEMICOLON, "Expected ';'");

    const updates: Expression[] = [];
    if (!this.stream.check(TokenType.RPAREN)) {
      do {
        updates.push(this.expressionParser.parseExpression());
      } while (this.stream.match(TokenType.COMMA));
    }

    this.stream.consume(TokenType.RPAREN, "Expected ')'");
    const body = this.statementParser.parseBlock();

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

  // layer (Type id : iterable) fold...unfold
  private parseForEach(start: Token): Statement {
    const typeToken = this.stream.advance();
    const idToken = this.stream.consume(
      TokenType.IDENTIFIER,
      "Expected identifier",
    );

    this.stream.consume(TokenType.COLON, "Expected ':'");

    const iterable = this.expressionParser.parseExpression();

    this.stream.consume(TokenType.RPAREN, "Expected ')'");
    const body = this.statementParser.parseBlock();

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
