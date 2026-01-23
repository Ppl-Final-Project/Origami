import {
  ParseResult,
  Program,
  Statement,
  ASTNodeType,
  TokenType,
  Token,
} from "@/types";
import { ErrorHandler } from "./parser/error";
import { ExpressionParser } from "./parser/expression";
import { TokenStream } from "./parser/helpers";
import { PrimaryParser } from "./parser/primaries";
import { StatementParser } from "./parser/statement";
import { ControlFlowParser } from "./parser/control";

/*
*
A harsh refactor from the one file version.
Composition is good!
*
*/
export class OrigamiParser {
  constructor(private tokens: Token[]) {}

  private errHandler: ErrorHandler = new ErrorHandler();
  private stream: TokenStream = new TokenStream(this.tokens, this.errHandler);
  private primaryParser: PrimaryParser = new PrimaryParser(
    this.stream,
    this.errHandler,
  );
  private expressionParser: ExpressionParser = new ExpressionParser(
    this.stream,
    this.errHandler,
    this.primaryParser,
  );
  private statementParser: StatementParser = new StatementParser(
    this.stream,
    this.errHandler,
    this.primaryParser,
    this.expressionParser,
  );

  public parse(): ParseResult {
    try {
      const program = this.parseProgram();

      const errs = this.errHandler.getErrors();
      return {
        success: errs.length === 0,
        errors: errs,
        ast: program,
      };
    } catch (error) {
      // Catch unexpected parsing errors
      this.errHandler.addError({
        line: this.stream.peek()?.line || 1,
        column: this.stream.peek()?.column || 1,
        message: `Unexpected error during parsing: ${error}`,
        length: 1,
        severity: "error",
      });

      const errs = this.errHandler.getErrors();
      return {
        success: false,
        errors: errs,
        ast: null,
      };
    }
  }

  private parseProgram(): Program {
    const statements: Statement[] = [];
    const startToken = this.stream.peek();

    while (!this.stream.isAtEnd()) {
      try {
        const stmt = this.statementParser.parseStatement();
        if (stmt) {
          statements.push(stmt);
        }
      } catch (error) {
        // On error, synchronize to the next statement
        this.stream.synchronize();
      }
    }

    return {
      type: ASTNodeType.PROGRAM,
      body: statements,
      line: startToken.line,
      column: startToken.column,
    };
  }

  protected reset() {
    this.tokens = [];
  }
}
