import { ErrorHandler } from "./error";
import { Token } from "@/types";

export class ParserBase extends ErrorHandler {
  protected tokens: Token[] = [];
  protected current: number = 0;
}
