import {
  ParseResult,
  Program,
  Statement,
  ASTNodeType,
  TokenType,
} from "@/types";
import { ParserBase } from "./parser/base";
import { StatementParserMixin } from "./parser/statement";
import { ExpressionParserMixin } from "./parser/expression";
import { HelperParserMixin } from "./parser/helpers";

/*
*
A harsh refactor from the one file version.

Make a new file and create a function:

```ts
export function ExpressionParserMixin<
  TBase extends new (...args: any[]) => ParserBase,
>(Base: TBase) {
  return class extends Base { // your main class.
    parseExpression() {}
    parseLiteral() {}
    parseBinary() {}
  };
}
```

Put that function in the OrigamiParser:
	export class OrigamiParser extends ParserBase
to:
	export class OrigamiParser extends ExpressionParserMixin(ParserBase)

If you want to make a feature,
	either make helper functions in the pre-existing mixins
	or if the feature is BIG, make another mixin as shown above.
Do note that **order matters**. Statements should be below Expressions, and etc.
*
*/
export class OrigamiParser extends StatementParserMixin(
  ExpressionParserMixin(HelperParserMixin(ParserBase)),
) {
  public parse(): ParseResult {
    this.current = 0;

    try {
      const program = this.parseProgram();

      return {
        success: this.errors.length === 0,
        errors: this.errors,
        ast: program,
      };
    } catch (error) {
      // Catch unexpected parsing errors
      this.addError({
        line: this.peek()?.line || 1,
        column: this.peek()?.column || 1,
        message: `Unexpected error during parsing: ${error}`,
        length: 1,
        severity: "error",
      });

      return {
        success: false,
        errors: this.errors,
        ast: null,
      };
    }
  }

  private parseProgram(): Program {
    const statements: Statement[] = [];
    const startToken = this.peek();

    while (!this.isAtEnd()) {
      try {
        const stmt = this.parseStatement();
        if (stmt) {
          statements.push(stmt);
        }
      } catch (error) {
        // On error, synchronize to the next statement
        this.synchronize();
      }
    }

    return {
      type: ASTNodeType.PROGRAM,
      body: statements,
      line: startToken.line,
      column: startToken.column,
    };
  }

  // Synchronizes the parser after an error
  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      // Stop at the end of a statement
      if (this.previous().type === TokenType.SEMICOLON) {
        return;
      }

      // Stop at the likely beginning of a new statement
      if (this.isType() || this.check(TokenType.IDENTIFIER)) {
        return;
      }

      this.advance();
    }
  }
}
