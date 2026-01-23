import {
  TokenType,
  ClassDeclaration,
  MethodDeclaration,
  Parameter,
  ASTNodeType,
  DeclarationStatement,
  Expression,
  Statement,
} from "@/types";
import { TokenStream } from "./helpers";
import { ErrorHandler } from "./error";
import { ExpressionParser } from "./expression";

export class ClassParser {
  constructor(
    private stream: TokenStream,
    private errHandler: ErrorHandler,
    private expressionParser: ExpressionParser,
    private parseBlock: () => Statement[],
  ) {}

  // [modifiers] blueprint ClassName [inherit Super] fold...unfold
  startsWithClass(): boolean {
    if (this.stream.check(TokenType.BLUEPRINT)) return true;

    let offset = 0;
    while (offset < 5) {
      const token = this.stream.peekAhead(offset);
      if (!token || token.type === TokenType.EOF) return false;
      if (token.type === TokenType.BLUEPRINT) return true;

      if (this.isModifier(token.type)) {
        offset++;
        continue;
      }
      return false;
    }
    return false;
  }

  parseClass(): ClassDeclaration {
    const startToken = this.stream.peek();
    const modifiers = this.parseModifiers();

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
      const memberType = this.detectMemberType(className);

      if (memberType === "method" || memberType === "constructor") {
        methods.push(this.parseMethod());
      } else if (memberType === "field") {
        fields.push(this.parseField());
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

  // Distinguishes method, constructor, or field at current position
  private detectMemberType(
    className: string,
  ): "method" | "constructor" | "field" | "unknown" {
    let offset = 0;

    while (offset < 5) {
      const token = this.stream.peekAhead(offset);
      if (!token) return "unknown";
      if (this.isModifier(token.type)) {
        offset++;
        continue;
      }
      break;
    }

    const firstToken = this.stream.peekAhead(offset);
    if (!firstToken) return "unknown";

    if (firstToken.type === TokenType.IDENTIFIER) {
      const nextToken = this.stream.peekAhead(offset + 1);
      if (
        firstToken.value === className &&
        nextToken?.type === TokenType.LPAREN
      ) {
        return "constructor";
      }
    }

    if (!this.isTypeKeyword(firstToken.type)) return "unknown";

    const secondToken = this.stream.peekAhead(offset + 1);
    if (!secondToken) return "unknown";

    if (secondToken.type === TokenType.IDENTIFIER) {
      const thirdToken = this.stream.peekAhead(offset + 2);
      if (thirdToken?.type === TokenType.LPAREN) return "method";
    }

    if (
      secondToken.type === TokenType.IDENTIFIER ||
      secondToken.type === TokenType.QUESTION
    ) {
      return "field";
    }

    return "unknown";
  }

  private parseMethod(): MethodDeclaration {
    const startToken = this.stream.peek();
    const modifiers = this.parseModifiers();
    let returnType = "void";

    if (
      this.stream.check(TokenType.IDENTIFIER) &&
      this.stream.peekAhead(1)?.type === TokenType.LPAREN
    ) {
      returnType = "constructor";
    } else {
      returnType = this.stream.advance().value;
    }

    const methodNameToken = this.stream.consume(
      TokenType.IDENTIFIER,
      "Expected method name",
    );
    const methodName = methodNameToken?.value || "unknownMethod";

    this.stream.consume(TokenType.LPAREN, "Expected '(' after method name");
    const parameters = this.parseParameters();
    this.stream.consume(TokenType.RPAREN, "Expected ')' after parameters");

    const body = this.parseBlock();

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

  private parseField(): DeclarationStatement {
    const startToken = this.stream.peek();
    const modifiers = this.parseModifiers();

    const typeToken = this.stream.advance();
    const dataType = typeToken.value;

    let isNullable = false;
    if (this.stream.check(TokenType.QUESTION)) {
      this.stream.advance();
      isNullable = true;
    }

    const nameToken = this.stream.consume(
      TokenType.IDENTIFIER,
      "Expected field name",
    );

    let initializer: Expression | undefined;
    if (this.stream.check(TokenType.ASSIGN)) {
      this.stream.advance();
      initializer = this.expressionParser.parseExpression();
    }

    this.stream.consume(TokenType.SEMICOLON, "Expected ';' after field");

    return {
      type: ASTNodeType.DECLARATION_STATEMENT,
      dataType,
      isNullable,
      modifiers,
      declarators: [
        {
          type: ASTNodeType.DECLARATOR,
          identifier: {
            type: ASTNodeType.IDENTIFIER,
            name: nameToken?.value || "unknownField",
            line: nameToken?.line || startToken.line,
            column: nameToken?.column || startToken.column,
          },
          initializer,
          line: nameToken?.line || startToken.line,
          column: nameToken?.column || startToken.column,
        },
      ],
      line: startToken.line,
      column: startToken.column,
    };
  }

  private parseParameters(): Parameter[] {
    const parameters: Parameter[] = [];
    if (this.stream.check(TokenType.RPAREN)) return parameters;

    do {
      const paramStart = this.stream.peek();

      if (!this.isTypeKeyword(this.stream.peek().type)) {
        this.errHandler.addError({
          line: paramStart.line,
          column: paramStart.column,
          message: "Expected parameter type",
          length: 1,
          severity: "error",
        });
        break;
      }

      const typeToken = this.stream.advance();

      let isNullable = false;
      if (this.stream.check(TokenType.QUESTION)) {
        this.stream.advance();
        isNullable = true;
      }

      let isArray = false;
      if (this.stream.check(TokenType.LBRACKET)) {
        this.stream.advance();
        this.stream.consume(TokenType.RBRACKET, "Expected ']'");
        isArray = true;
      }

      const nameToken = this.stream.consume(
        TokenType.IDENTIFIER,
        "Expected parameter name",
      );

      let defaultValue: Expression | undefined;
      if (this.stream.check(TokenType.ASSIGN)) {
        this.stream.advance();
        defaultValue = this.expressionParser.parseExpression();
      }

      parameters.push({
        type: ASTNodeType.PARAMETER,
        dataType: typeToken.value,
        name: nameToken?.value || "unknownParam",
        isArray,
        isNullable,
        defaultValue,
        line: paramStart.line,
        column: paramStart.column,
      });

      if (!this.stream.check(TokenType.COMMA)) break;
      this.stream.advance();
    } while (!this.stream.check(TokenType.RPAREN) && !this.stream.isAtEnd());

    return parameters;
  }

  private parseModifiers(): string[] {
    const modifiers: string[] = [];
    while (this.isModifier(this.stream.peek().type)) {
      modifiers.push(this.stream.advance().value);
    }
    return modifiers;
  }

  private isModifier(type: TokenType): boolean {
    return (
      type === TokenType.OPEN ||
      type === TokenType.SEALED ||
      type === TokenType.GUIDE
    );
  }

  private isTypeKeyword(type: TokenType): boolean {
    return (
      type === TokenType.FLAT ||
      type === TokenType.CREASE ||
      type === TokenType.STRIP ||
      type === TokenType.EDGE ||
      type === TokenType.MARK ||
      type === TokenType.THIN ||
      type === TokenType.THICK
    );
  }
}
