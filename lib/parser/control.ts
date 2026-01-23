import { TokenType } from "@/types";
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
  ) {}

  startsWithConditional() {
    return this.stream.match(TokenType.FRONT);
  }
  parseConditionals() {}

  parseIfStatement() {}
  parseElseStatement() {}
}
