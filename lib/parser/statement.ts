import {
  Statement,
  TokenType,
  InputStatement,
  Identifier,
  ASTNodeType,
  Declarator,
  InputMethodCall,
  Expression,
} from "@/types";
import { TokenStream } from "./helpers";
import { ErrorHandler } from "./error";
import { ExpressionParser } from "./expression";
import { PrimaryParser } from "./primaries";
import { ControlFlowParser } from "./control";
import { IteratorParser } from "./iterators";

export class StatementParser {
  private controlParser: ControlFlowParser;
  private iteratorParser: IteratorParser;
  constructor(
    private stream: TokenStream,
    private errHandler: ErrorHandler,
    private primaryParser: PrimaryParser,
    private expressionParser: ExpressionParser,
  ) {
    this.controlParser = new ControlFlowParser(
      this.stream,
      this.expressionParser,
      this,
    );
    this.iteratorParser = new IteratorParser(
      this.stream,
      this.expressionParser,
      this,
    );
  }
  parseStatement(): Statement {
    this.stream.checkProgress("parseStatement");

    if (this.stream.startsWithType()) {
      return this.parseDeclarationOrInputStatement();
    }
    if (this.isAssignmentForm()) {
      return this.parseAssignmentForm();
    }
    if (this.controlParser.startsWithConditional()) {
      return this.controlParser.parseConditionals();
    }
    if (this.iteratorParser.startsWithIterator()) {
      return this.iteratorParser.parseIterator();
    }

    return this.handleInvalidStatement();
  }

  parseBlock(): Statement[] {
    this.stream.consume(TokenType.FOLD, "Expected 'fold'.");

    const statements: Statement[] = [];

    while (!this.stream.check(TokenType.UNFOLD) && !this.stream.isAtEnd()) {
      const stmt = this.parseStatement();
      statements.push(stmt);
    }

    this.stream.consume(TokenType.UNFOLD, "Expected 'unfold'.");
    return statements;
  }

  private parseAssignmentForm(): InputStatement {
    const startToken = this.stream.peek();

    // Parse list of identifiers
    const identifiers: Identifier[] = [];
    identifiers.push(this.primaryParser.parseIdentifier());

    while (this.stream.check(TokenType.COMMA)) {
      this.stream.advance(); // consume comma
      identifiers.push(this.primaryParser.parseIdentifier());
    }

    this.stream.consume(TokenType.ASSIGN, "Expected '=' in input statement");

    const inputMethodCall = this.primaryParser.parseInputMethodCall();

    this.stream.consume(
      TokenType.SEMICOLON,
      "Expected ';' after input statement",
    );

    return {
      type: ASTNodeType.INPUT_STATEMENT,
      identifiers,
      inputMethodCall,
      line: startToken.line,
      column: startToken.column,
    };
  }

  private isAssignmentForm(): boolean {
    if (!this.stream.check(TokenType.IDENTIFIER)) return false;

    const next = this.stream.peekAhead(1);
    return next?.type === TokenType.COMMA || next?.type === TokenType.ASSIGN;
  }

  private parseDeclarationOrInputStatement(): Statement {
    const typeToken = this.stream.advance();
    const dataType = typeToken.value;
    const startLine = typeToken.line;
    const startColumn = typeToken.column;

    const declarators: Declarator[] = [];

    // Parse declarators separated by commas
    do {
      if (this.stream.check(TokenType.COMMA)) {
        this.stream.advance(); // consume comma
      }

      const identifier = this.primaryParser.parseIdentifier();
      let initializer: Expression | undefined = undefined;

      if (this.stream.check(TokenType.ASSIGN)) {
        this.stream.advance(); // consume =
        initializer = this.expressionParser.parseExpression();
      }

      declarators.push({
        type: ASTNodeType.DECLARATOR,
        identifier,
        initializer,
        line: identifier.line,
        column: identifier.column,
      });
    } while (this.stream.check(TokenType.COMMA));

    // Special case: check if this is an input statement
    // This is true if there is only one initializer and it's an input call
    const lastDeclarator = declarators[declarators.length - 1];
    if (
      lastDeclarator?.initializer?.type === ASTNodeType.INPUT_METHOD_CALL &&
      declarators.every(
        (d, i) => i === declarators.length - 1 || !d.initializer,
      )
    ) {
      const identifiers = declarators.map((d) => d.identifier);
      this.stream.consume(
        TokenType.SEMICOLON,
        "Expected ';' after input statement",
      );
      return {
        type: ASTNodeType.INPUT_STATEMENT,
        dataType,
        identifiers,
        inputMethodCall: lastDeclarator.initializer as InputMethodCall,
        line: startLine,
        column: startColumn,
      };
    }

    this.stream.consume(
      TokenType.SEMICOLON,
      "Expected ';' after declaration statement",
    );

    return {
      type: ASTNodeType.DECLARATION_STATEMENT,
      dataType,
      declarators,
      line: startLine,
      column: startColumn,
    };
  }

  private handleInvalidStatement(): Statement {
    const token = this.stream.peek();

    this.errHandler.addError({
      line: token.line,
      column: token.column,
      message: `Unexpected token '${token.value}' at start of statement`,
      length: token.value.length,
      severity: "error",
    });

    this.stream.synchronize();

    return {
      type: ASTNodeType.ERROR_STATEMENT,
      line: token.line,
      column: token.column,
    };
  }
}
