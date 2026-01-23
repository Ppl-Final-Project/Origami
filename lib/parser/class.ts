import {
  TokenType,
  ClassDeclaration,
  MethodDeclaration,
  Parameter,
  ASTNodeType,
  DeclarationStatement,
} from "@/types";
import { TokenStream } from "./helpers";
import { ErrorHandler } from "./error";
import { StatementParser } from "./statement";

export class ClassParser {
  constructor(
    private stream: TokenStream,
    private errHandler: ErrorHandler,
    private statementParser: StatementParser,
  ) {}

  /** Checks if the current token sequence starts a class declaration. */
  startsWithClass(): boolean {
    if (this.stream.check(TokenType.BLUEPRINT)) {
      return true;
    }

    let offset = 0;
    while (offset < 5) {
      const token = this.stream.peekAhead(offset);
      if (!token || token.type === TokenType.EOF) return false;

      if (token.type === TokenType.BLUEPRINT) {
        return true;
      }

      if (
        token.type === TokenType.OPEN ||
        token.type === TokenType.SEALED ||
        token.type === TokenType.GUIDE
      ) {
        offset++;
        continue;
      }

      return false;
    }

    return false;
  }

  /** Parses a class declaration. */
  parseClass(): ClassDeclaration {
    const startToken = this.stream.peek();
    const modifiers: string[] = [];

    while (
      this.stream.match(TokenType.OPEN, TokenType.SEALED, TokenType.GUIDE)
    ) {
      modifiers.push(this.stream.advance().value);
    }

    this.stream.consume(TokenType.BLUEPRINT, "Expected 'blueprint' keyword");

    const classNameToken = this.stream.consume(
      TokenType.IDENTIFIER,
      "Expected class name after 'blueprint'",
    );
    const className = classNameToken?.value || "UnknownClass";

    let superClass: string | undefined;
    if (this.stream.check(TokenType.INHERIT)) {
      this.stream.advance();
      const superToken = this.stream.consume(
        TokenType.IDENTIFIER,
        "Expected superclass name after 'inherit'",
      );
      superClass = superToken?.value;
    }

    this.stream.consume(TokenType.FOLD, "Expected 'fold' after class name");

    const methods: MethodDeclaration[] = [];
    const fields: DeclarationStatement[] = [];

    while (!this.stream.check(TokenType.UNFOLD) && !this.stream.isAtEnd()) {
      if (this.startsWithMethod()) {
        methods.push(this.parseMethod());
      } else if (this.stream.startsWithType()) {
        const fieldStmt = this.statementParser.parseStatement();
        if (fieldStmt.type === ASTNodeType.DECLARATION_STATEMENT) {
          fields.push(fieldStmt as DeclarationStatement);
        } else {
          this.errHandler.addError({
            line: this.stream.peek().line,
            column: this.stream.peek().column,
            message: "Expected field declaration or method in class body",
            length: 1,
            severity: "error",
          });
        }
      } else {
        this.errHandler.addError({
          line: this.stream.peek().line,
          column: this.stream.peek().column,
          message: "Unexpected token in class body",
          length: 1,
          severity: "error",
        });
        this.stream.advance();
      }
    }

    this.stream.consume(TokenType.UNFOLD, "Expected 'unfold' after class body");

    return {
      type: ASTNodeType.CLASS_DECLARATION,
      modifiers,
      name: className,
      superClass,
      methods,
      fields,
      line: startToken.line,
      column: startToken.column,
    };
  }

  /** Checks if the current token sequence starts a method declaration. */
  private startsWithMethod(): boolean {
    let offset = 0;

    while (offset < 5) {
      const token = this.stream.peekAhead(offset);
      if (!token) return false;

      if (
        token.type === TokenType.OPEN ||
        token.type === TokenType.GUIDE ||
        token.type === TokenType.SEALED
      ) {
        offset++;
        continue;
      }
      break;
    }

    const typeToken = this.stream.peekAhead(offset);
    if (!typeToken) return false;

    const isTypeKeyword =
      typeToken.type === TokenType.FLAT ||
      typeToken.type === TokenType.CREASE ||
      typeToken.type === TokenType.STRIP ||
      typeToken.type === TokenType.EDGE ||
      typeToken.type === TokenType.MARK ||
      typeToken.type === TokenType.THIN ||
      typeToken.type === TokenType.THICK;

    if (!isTypeKeyword) return false;

    const nameToken = this.stream.peekAhead(offset + 1);
    if (!nameToken || nameToken.type !== TokenType.IDENTIFIER) return false;

    const parenToken = this.stream.peekAhead(offset + 2);
    if (!parenToken || parenToken.type !== TokenType.LPAREN) return false;

    return true;
  }

  /** Parses a method declaration. */
  private parseMethod(): MethodDeclaration {
    const startToken = this.stream.peek();
    const modifiers: string[] = [];

    while (
      this.stream.match(TokenType.OPEN, TokenType.GUIDE, TokenType.SEALED)
    ) {
      modifiers.push(this.stream.advance().value);
    }

    const returnTypeToken = this.stream.advance();
    const returnType = returnTypeToken.value;

    const methodNameToken = this.stream.consume(
      TokenType.IDENTIFIER,
      "Expected method name",
    );
    const methodName = methodNameToken?.value || "unknownMethod";

    this.stream.consume(TokenType.LPAREN, "Expected '(' after method name");
    const parameters = this.parseParameters();
    this.stream.consume(TokenType.RPAREN, "Expected ')' after parameters");

    const body = this.statementParser.parseBlock();

    return {
      type: ASTNodeType.METHOD_DECLARATION,
      modifiers,
      returnType,
      name: methodName,
      parameters,
      body,
      line: startToken.line,
      column: startToken.column,
    };
  }

  /** Parses method parameters. */
  private parseParameters(): Parameter[] {
    const parameters: Parameter[] = [];

    if (this.stream.check(TokenType.RPAREN)) {
      return parameters;
    }

    do {
      const paramStartToken = this.stream.peek();

      if (!this.stream.startsWithType()) {
        this.errHandler.addError({
          line: this.stream.peek().line,
          column: this.stream.peek().column,
          message: "Expected parameter type",
          length: 1,
          severity: "error",
        });
        break;
      }

      const paramTypeToken = this.stream.advance();
      const paramType = paramTypeToken.value;

      let isArray = false;
      if (this.stream.check(TokenType.LBRACKET)) {
        this.stream.advance();
        this.stream.consume(TokenType.RBRACKET, "Expected ']' after '['");
        isArray = true;
      }

      const paramNameToken = this.stream.consume(
        TokenType.IDENTIFIER,
        "Expected parameter name",
      );
      const paramName = paramNameToken?.value || "unknownParam";

      parameters.push({
        type: ASTNodeType.PARAMETER,
        dataType: paramType,
        name: paramName,
        isArray,
        line: paramStartToken.line,
        column: paramStartToken.column,
      });

      if (!this.stream.check(TokenType.COMMA)) {
        break;
      }
      this.stream.advance();
    } while (!this.stream.check(TokenType.RPAREN) && !this.stream.isAtEnd());

    return parameters;
  }
}
