import { ErrorHandler } from "./error";
import { ExpressionParser } from "./expression";
import { TokenStream } from "./helpers";
import { PrimaryParser } from "./primaries";

export class ControlFlowParser {
  constructor(
    private tokens: TokenStream,
    private errHandler: ErrorHandler,
    private primaryParser: PrimaryParser,
    private expressionParser: ExpressionParser,
  ) {}

  parseIfStatement() {}
  parseElseStatement() {}
}
