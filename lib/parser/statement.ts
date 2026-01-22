import { Statement } from "@/types";
import { ParserBase } from "./base";

export function StatementParserMixin<
  TBase extends new (...args: any[]) => ParserBase,
>(Base: TBase) {
  return class extends Base {
    parseStatement(): Statement | null {
      throw new Error("todo");
    }
    parseIfStatement() {
      throw new Error("todo");
    }
    parseWhileStatement() {
      throw new Error("todo");
    }
  };
}
