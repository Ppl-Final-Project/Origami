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

export class StatementParser {
  constructor(
    private tokens: TokenStream,
    private errHandler: ErrorHandler,
    private primaryParser: PrimaryParser,
    private expressionParser: ExpressionParser,
  ) {}
  parseStatement(): Statement | null {
    // Handle statements starting with a type keyword
    if (this.tokens.isType()) {
      return this.parseDeclarationOrInputStatement();
    }

    // Handle input statements in assignment form
    if (this.isInputStatementWithoutType()) {
      return this.parseInputStatementWithoutType();
    }

    // Handle unknown statement patterns
    const token = this.tokens.peek();
    this.errHandler.addError({
      line: token.line,
      column: token.column,
      message: `Unexpected token '${token.value}' at start of statement`,
      length: token.value.length,
      severity: "error",
    });
    this.tokens.advance();
    return null;
  }

  private handleInvalidStatement(): null {
    const token = this.tokens.peek();

    this.errHandler.addError({
      line: token.line,
      column: token.column,
      message: `Unexpected token '${token.value}' at start of statement`,
      length: token.value.length,
      severity: "error",
    });

    return null;
  }
  private parseInputStatementWithoutType(): InputStatement {
    const startToken = this.tokens.peek();

    // Parse list of identifiers
    const identifiers: Identifier[] = [];
    identifiers.push(this.primaryParser.parseIdentifier());

    while (this.tokens.check(TokenType.COMMA)) {
      this.tokens.advance(); // consume comma
      identifiers.push(this.primaryParser.parseIdentifier());
    }

    this.tokens.consume(TokenType.ASSIGN, "Expected '=' in input statement");

    const inputMethodCall = this.primaryParser.parseInputMethodCall();

    this.tokens.consume(
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

  private isInputStatementWithoutType(): boolean {
    if (!this.tokens.check(TokenType.IDENTIFIER)) return false;

    const next = this.tokens.peekAhead(1);
    return next?.type === TokenType.COMMA || next?.type === TokenType.ASSIGN;
  }

  private parseDeclarationOrInputStatement(): Statement {
    const typeToken = this.tokens.advance();
    const dataType = typeToken.value;
    const startLine = typeToken.line;
    const startColumn = typeToken.column;

    const declarators: Declarator[] = [];

    // Parse declarators separated by commas
    do {
      if (this.tokens.check(TokenType.COMMA)) {
        this.tokens.advance(); // consume comma
      }

      const identifier = this.primaryParser.parseIdentifier();
      let initializer: Expression | undefined = undefined;

      if (this.tokens.check(TokenType.ASSIGN)) {
        this.tokens.advance(); // consume =
        initializer = this.expressionParser.parseExpression();
      }

      declarators.push({
        type: ASTNodeType.DECLARATOR,
        identifier,
        initializer,
        line: identifier.line,
        column: identifier.column,
      });
    } while (this.tokens.check(TokenType.COMMA));

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
      this.tokens.consume(
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

    this.tokens.consume(
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

  parseIfStatement() {
    const token = this.tokens.consume(
      TokenType.FRONT,
      "Expected front keyword for the conditional statement.",
    );
  }
  parseWhileStatement() {
    throw new Error("todo");
  }
}
