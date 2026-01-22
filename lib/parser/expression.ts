import { ParserBase } from "./base";

export function ExpressionParserMixin<
  TBase extends new (...args: any[]) => ParserBase,
>(Base: TBase) {
  return class extends Base {
    parseExpression() {}
    parseLiteral() {}
    parseBinary() {}
  };
}
