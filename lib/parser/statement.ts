import {
  Statement,
  TokenType,
  Identifier,
  ASTNodeType,
  Declarator,
  InputMethodCall,
  Expression,
  Parameter,
} from "@/types";
import { TokenStream } from "./helpers";
import { ErrorHandler } from "./error";
import { ExpressionParser } from "./expression";
import { PrimaryParser } from "./primaries";
import { ControlFlowParser } from "./control";
import { IteratorParser } from "./iterators";
import { ClassParser } from "./class";
import { FunctionParser } from "./function";

export class StatementParser {
  private controlParser: ControlFlowParser;
  private iteratorParser: IteratorParser;
  private classParser: ClassParser;
  private functionParser: FunctionParser;

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
    this.classParser = new ClassParser(
      this.stream,
      this.errHandler,
      this.expressionParser,
      () => this.parseBlock(),
    );
    this.functionParser = new FunctionParser(
      this.stream,
      this.errHandler,
      this.expressionParser,
      () => this.parseBlock(),
    );
  }

  // Main dispatch: identifies and delegates to appropriate statement parser
  parseStatement(): Statement {
    this.stream.checkProgress("parseStatement");

    if (this.classParser.startsWithClass()) {
      return this.classParser.parseClass();
    }
    if (this.stream.check(TokenType.REVEAL)) return this.parseReturnStatement();
    if (this.stream.check(TokenType.DRAFT)) return this.parseTryStatement();
    if (this.stream.check(TokenType.CRUMPLE)) return this.parseThrowStatement();
    if (this.functionParser.startsWithFunction()) {
      return this.functionParser.parseFunctionDeclaration();
    }
    if (this.stream.startsWithType())
      return this.parseDeclarationOrInputStatement();
    if (this.isAssignmentForm()) return this.parseAssignmentForm();
    if (this.controlParser.startsWithConditional()) {
      return this.controlParser.parseConditionals();
    }
    if (this.iteratorParser.startsWithIterator())
      return this.iteratorParser.parseIterator();

    if (
      this.stream.check(TokenType.IDENTIFIER) ||
      this.stream.check(TokenType.SHEET)
    ) {
      return this.parseExpressionStatement();
    }

    return this.handleInvalidStatement();
  }

  parseBlock(): Statement[] {
    this.stream.consume(TokenType.FOLD, "Expected 'fold'.");
    const statements: Statement[] = [];

    while (!this.stream.check(TokenType.UNFOLD) && !this.stream.isAtEnd()) {
      statements.push(this.parseStatement());
    }

    this.stream.consume(TokenType.UNFOLD, "Expected 'unfold'.");
    return statements;
  }

  // reveal [expr];
  private parseReturnStatement(): Statement {
    const startToken = this.stream.advance();

    let argument: Expression | null = null;
    if (
      !this.stream.check(TokenType.SEMICOLON) &&
      !this.stream.check(TokenType.UNFOLD)
    ) {
      argument = this.expressionParser.parseExpression();
    }

    if (this.stream.check(TokenType.SEMICOLON)) {
      this.stream.advance();
    }

    return {
      type: ASTNodeType.RETURN_STATEMENT,
      argument,
      line: startToken.line,
      column: startToken.column,
    };
  }

  // draft fold...unfold smooth (Type param) fold...unfold
  private parseTryStatement(): Statement {
    const startToken = this.stream.advance(); // consume 'draft'

    const tryBody = this.parseBlock();

    let handler = null;
    if (this.stream.check(TokenType.SMOOTH)) {
      handler = this.parseCatchClause();
    }

    return {
      type: ASTNodeType.TRY_STATEMENT,
      body: tryBody,
      handler,
      line: startToken.line,
      column: startToken.column,
    };
  }

  private parseCatchClause(): {
    type: ASTNodeType.CATCH_CLAUSE;
    param: Parameter | null;
    body: Statement[];
    line: number;
    column: number;
  } {
    const startToken = this.stream.advance(); // consume 'smooth'

    let param: Parameter | null = null;

    // Parse optional (Type param)
    if (this.stream.check(TokenType.LPAREN)) {
      this.stream.advance();

      if (this.stream.startsWithType()) {
        const typeToken = this.stream.advance();
        const nameToken = this.stream.consume(
          TokenType.IDENTIFIER,
          "Expected parameter name",
        );

        param = {
          type: ASTNodeType.PARAMETER,
          dataType: typeToken.value,
          name: nameToken?.value || "error",
          isArray: false,
          line: typeToken.line,
          column: typeToken.column,
        };
      }

      this.stream.consume(TokenType.RPAREN, "Expected ')' after catch param");
    }

    const body = this.parseBlock();

    return {
      type: ASTNodeType.CATCH_CLAUSE,
      param,
      body,
      line: startToken.line,
      column: startToken.column,
    };
  }

  // crumple expr;
  private parseThrowStatement(): Statement {
    const startToken = this.stream.advance();
    const argument = this.expressionParser.parseExpression();

    this.stream.consume(TokenType.SEMICOLON, "Expected ';' after throw");

    return {
      type: ASTNodeType.THROW_STATEMENT,
      argument,
      line: startToken.line,
      column: startToken.column,
    };
  }

  // Expression statement or member assignment (sheet.field = value)
  private parseExpressionStatement(): Statement {
    const startToken = this.stream.peek();
    const expr = this.expressionParser.parseExpression();

    // Check if this is an assignment to a member expression: sheet.balance = value
    if (this.stream.check(TokenType.ASSIGN)) {
      this.stream.advance(); // consume '='
      const value = this.expressionParser.parseExpression();
      this.stream.consume(TokenType.SEMICOLON, "Expected ';' after statement");

      return {
        type: ASTNodeType.MEMBER_ASSIGNMENT,
        target: expr,
        value,
        line: startToken.line,
        column: startToken.column,
      } as any;
    }

    this.stream.consume(TokenType.SEMICOLON, "Expected ';' after expression");

    return {
      type: ASTNodeType.EXPRESSION_STATEMENT,
      expression: expr,
      line: startToken.line,
      column: startToken.column,
    };
  }

  parseAssignmentForm(): Statement {
    const startToken = this.stream.peek();
    const identifiers: Identifier[] = [];

    identifiers.push(this.primaryParser.parseIdentifier());

    while (this.stream.check(TokenType.COMMA)) {
      this.stream.advance();
      identifiers.push(this.primaryParser.parseIdentifier());
    }

    this.stream.consume(TokenType.ASSIGN, "Expected '=' in assignment");
    const expression = this.expressionParser.parseExpression();
    this.stream.consume(TokenType.SEMICOLON, "Expected ';' after statement");

    if (expression.type === ASTNodeType.INPUT_METHOD_CALL) {
      return {
        type: ASTNodeType.INPUT_STATEMENT,
        identifiers,
        inputMethodCall: expression as InputMethodCall,
        line: startToken.line,
        column: startToken.column,
      };
    }

    if (identifiers.length > 1) {
      this.errHandler.addError({
        line: startToken.line,
        column: startToken.column,
        message: "Multiple identifiers are only allowed in input statements",
        length: 1,
        severity: "error",
      });
    }

    return {
      type: ASTNodeType.ASSIGNMENT_STATEMENT,
      identifier: identifiers[0],
      value: expression,
      line: startToken.line,
      column: startToken.column,
    };
  }

  parseVariableDeclaration(consumeSemicolon = true): Statement {
    const typeToken = this.stream.advance();
    const dataType = typeToken.value;
    const startLine = typeToken.line;
    const startColumn = typeToken.column;

    let isNullable = false;
    if (this.stream.check(TokenType.QUESTION)) {
      this.stream.advance();
      isNullable = true;
    }

    const declarators: Declarator[] = [];

    do {
      if (this.stream.check(TokenType.COMMA)) {
        this.stream.advance();
      }

      const identifier = this.primaryParser.parseIdentifier();
      let initializer: Expression | undefined;

      if (this.stream.check(TokenType.ASSIGN)) {
        this.stream.advance();
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

    if (consumeSemicolon) {
      this.stream.consume(
        TokenType.SEMICOLON,
        "Expected ';' after variable declaration",
      );
    }

    return {
      type: ASTNodeType.DECLARATION_STATEMENT,
      dataType,
      isNullable,
      declarators,
      line: startLine,
      column: startColumn,
    };
  }

  private isAssignmentForm(): boolean {
    if (
      !this.stream.check(TokenType.IDENTIFIER) &&
      !this.stream.check(TokenType.SHEET)
    )
      return false;
    const next = this.stream.peekAhead(1);
    return next?.type === TokenType.COMMA || next?.type === TokenType.ASSIGN;
  }

  private parseDeclarationOrInputStatement(): Statement {
    const typeToken = this.stream.advance();
    const dataType = typeToken.value;
    const startLine = typeToken.line;
    const startColumn = typeToken.column;

    let isNullable = false;
    if (this.stream.check(TokenType.QUESTION)) {
      this.stream.advance();
      isNullable = true;
    }

    const declarators: Declarator[] = [];

    do {
      if (this.stream.check(TokenType.COMMA)) {
        this.stream.advance();
      }

      const identifier = this.primaryParser.parseIdentifier();
      let initializer: Expression | undefined;

      if (this.stream.check(TokenType.ASSIGN)) {
        this.stream.advance();
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

    // Check if it's an input statement
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
      isNullable,
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
