import {
  Statement,
  StatementParserFn,
  TokenType,
  Expression,
  ASTNodeType,
} from "@/types";
import { ExpressionParser } from "./expression";
import { TokenStream } from "./helpers";
import { StatementParser } from "./statement";

type Branches = {
  condition: Expression | null;
  body: Statement[];
};

export class ControlFlowParser {
  constructor(
    private stream: TokenStream,
    private expressionParser: ExpressionParser,
    private statementParser: StatementParser,
  ) {}

  startsWithConditional() {
    return this.stream.match(TokenType.FRONT);
  }
  parseConditionals(): Statement {
    const branches: Branches[] = [];

    this.stream.consume(TokenType.FRONT, "Expected 'front'.");

    this.parseIf(branches);
    this.parseElseIf(branches);
    this.parseElse(branches);

    const first = branches[0].body[0] ?? this.stream.previous();

    return {
      type: ASTNodeType.CONDITIONAL_STATEMENT,
      branches,
      line: first.line,
      column: first.column,
    };
  }

  private parseIf(branches: Branches[]) {
    const condition = this.parseCondition();
    const body = this.parseBlock();
    branches.push({ condition, body });
  }

  private parseElseIf(branches: Branches[]) {
    while (
      this.stream.check(TokenType.BACK) &&
      this.stream.peekAhead(1)?.type === TokenType.FRONT
    ) {
      this.stream.advance(); // back
      this.stream.advance(); // front

      const elifCondition = this.parseCondition();
      const elifBody = this.parseBlock();

      branches.push({ condition: elifCondition, body: elifBody });
    }
  }
  private parseElse(branches: Branches[]) {
    if (this.stream.check(TokenType.BACK)) {
      this.stream.advance(); // back
      const elseBody = this.parseBlock();
      branches.push({ condition: null, body: elseBody });
    }
  }

  private parseCondition(): Expression {
    this.stream.consume(TokenType.LPAREN, "Expected '(' after 'front'.");
    const expr = this.expressionParser.parseExpression();
    this.stream.consume(TokenType.RPAREN, "Expected ')' after condition.");
    return expr;
  }

  private parseBlock(): Statement[] {
    this.stream.consume(TokenType.FOLD, "Expected 'fold'.");

    const statements: Statement[] = [];

    while (!this.stream.check(TokenType.UNFOLD) && !this.stream.isAtEnd()) {
      const stmt = this.statementParser.parseStatement();
      if (stmt) statements.push(stmt);
    }

    this.stream.consume(TokenType.UNFOLD, "Expected 'unfold'.");
    return statements;
  }
}
