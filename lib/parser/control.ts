import { StatementParserFn, TokenType } from "@/types";
import { ErrorHandler } from "./error";
import { ExpressionParser } from "./expression";
import { TokenStream } from "./helpers";
import { PrimaryParser } from "./primaries";

export class ControlFlowParser {
  constructor(
    private stream: TokenStream,
    private errHandler: ErrorHandler,
    private primaryParser: PrimaryParser,
    private expressionParser: ExpressionParser,
    private statementParser: StatementParserFn,
  ) {}

  startsWithConditional() {
    return this.stream.match(TokenType.FRONT);
  }
  parseConditionals() {
    const frontToken = this.stream.consume(
      TokenType.FRONT,
      "Expected 'front' for the conditional.",
    );

    this.stream.consume(TokenType.LPAREN, "Expected '('.");
    this.expressionParser.parseLiteral;
    this.stream.consume(TokenType.RPAREN, "Expected ')'.");
  }

  parseIfStatement() {}
  parseElseStatement() {}
}
