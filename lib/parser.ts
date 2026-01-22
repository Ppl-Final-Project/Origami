import {
  Token,
  TokenType,
  ParseError,
  ParseResult,
  Program,
  Statement,
  InputStatement,
  Declarator,
  Expression,
  Identifier,
  InputMethodCall,
  ASTNodeType,
} from "@/types";
import { OrigamiParser } from "./extension";

class Parser {
  private tokens: Token[];
  private current: number = 0;
  private errors: ParseError[] = [];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  // Initiates parsing
  parse(): ParseResult {
    this.current = 0;
    this.errors = [];

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

  // Parses the program's root
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

  // Parses a single statement
  private parseStatement(): Statement | null {
    // Handle statements starting with a type keyword
    if (this.isType()) {
      return this.parseDeclarationOrInputStatement();
    }

    // Handle input statements in assignment form
    if (this.check(TokenType.IDENTIFIER)) {
      // Peek ahead to confirm it's an input statement
      const nextToken = this.peekAhead(1);
      if (
        nextToken &&
        (nextToken.type === TokenType.COMMA ||
          nextToken.type === TokenType.ASSIGN)
      ) {
        return this.parseInputStatementWithoutType();
      }
    }

    // Handle unknown statement patterns
    const token = this.peek();
    this.addError({
      line: token.line,
      column: token.column,
      message: `Unexpected token '${token.value}' at start of statement`,
      length: token.value.length,
      severity: "error",
    });
    this.advance();
    return null;
  }

  // Parses statements starting with a type keyword
  private parseDeclarationOrInputStatement(): Statement {
    const typeToken = this.advance();
    const dataType = typeToken.value;
    const startLine = typeToken.line;
    const startColumn = typeToken.column;

    const declarators: Declarator[] = [];

    // Parse declarators separated by commas
    do {
      if (this.check(TokenType.COMMA)) {
        this.advance(); // consume comma
      }

      const identifier = this.parseIdentifier();
      let initializer: Expression | undefined = undefined;

      if (this.check(TokenType.ASSIGN)) {
        this.advance(); // consume =
        initializer = this.parseExpression();
      }

      declarators.push({
        type: ASTNodeType.DECLARATOR,
        identifier,
        initializer,
        line: identifier.line,
        column: identifier.column,
      });
    } while (this.check(TokenType.COMMA));

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
      this.consume(TokenType.SEMICOLON, "Expected ';' after input statement");
      return {
        type: ASTNodeType.INPUT_STATEMENT,
        dataType,
        identifiers,
        inputMethodCall: lastDeclarator.initializer as InputMethodCall,
        line: startLine,
        column: startColumn,
      };
    }

    this.consume(
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

  // Parses an input statement without a type declaration
  private parseInputStatementWithoutType(): InputStatement {
    const startToken = this.peek();

    // Parse list of identifiers
    const identifiers: Identifier[] = [];
    identifiers.push(this.parseIdentifier());

    while (this.check(TokenType.COMMA)) {
      this.advance(); // consume comma
      identifiers.push(this.parseIdentifier());
    }

    this.consume(TokenType.ASSIGN, "Expected '=' in input statement");

    const inputMethodCall = this.parseInputMethodCall();

    this.consume(TokenType.SEMICOLON, "Expected ';' after input statement");

    return {
      type: ASTNodeType.INPUT_STATEMENT,
      identifiers,
      inputMethodCall,
      line: startToken.line,
      column: startToken.column,
    };
  }

  // Parses an input method call
  private parseInputMethodCall(): InputMethodCall {
    const objectToken = this.peek();
    const object = this.parseIdentifier();

    this.consume(TokenType.DOT, "Expected '.' in input method call");

    const methodToken = this.consume(
      TokenType.IDENTIFIER,
      "Expected method name after '.'",
    );
    if (!methodToken) {
      throw new Error("Missing method name");
    }

    const method = methodToken.value;

    // Validate the input method name
    const validMethods = [
      "next",
      "nextStrip",
      "nextCrease",
      "nextThick",
      "nextThin",
      "nextEdge",
      "nextMark",
    ];
    if (!validMethods.includes(method)) {
      this.addError({
        line: methodToken.line,
        column: methodToken.column,
        message: `Invalid input method '${method}'. Expected one of: ${validMethods.join(", ")}`,
        length: method.length,
        severity: "error",
      });
    }

    this.consume(TokenType.LPAREN, "Expected '(' after method name");
    this.consume(TokenType.RPAREN, "Expected ')' after '('");

    return {
      type: ASTNodeType.INPUT_METHOD_CALL,
      object,
      method,
      line: objectToken.line,
      column: objectToken.column,
    };
  }

  // Parses a binary expression for addition/subtraction
  private parseExpression(): Expression {
    let left = this.parseTerm();

    while (this.check(TokenType.PLUS) || this.check(TokenType.MINUS)) {
      const operatorToken = this.advance();
      const right = this.parseTerm();

      left = {
        type: ASTNodeType.BINARY_EXPRESSION,
        operator: operatorToken.value,
        left,
        right,
        line: operatorToken.line,
        column: operatorToken.column,
      };
    }

    return left;
  }

  // Parses a binary expression for multiplication/division/modulo
  private parseTerm(): Expression {
    let left = this.parseFactor();

    while (
      this.check(TokenType.MULTIPLY) ||
      this.check(TokenType.DIVIDE) ||
      this.check(TokenType.MODULO)
    ) {
      const operatorToken = this.advance();
      const right = this.parseFactor();

      left = {
        type: ASTNodeType.BINARY_EXPRESSION,
        operator: operatorToken.value,
        left,
        right,
        line: operatorToken.line,
        column: operatorToken.column,
      };
    }

    return left;
  }

  // Parses a factor (the highest-precedence expression)
  private parseFactor(): Expression {
    // Parenthesized expression
    if (this.check(TokenType.LPAREN)) {
      this.advance(); // consume (
      const expr = this.parseExpression();
      this.consume(TokenType.RPAREN, "Expected ')' after expression");
      return expr;
    }

    // Literal (number or string)
    if (this.check(TokenType.NUMBER) || this.check(TokenType.STRING)) {
      const token = this.advance();
      return {
        type: ASTNodeType.LITERAL,
        value: this.check(TokenType.NUMBER)
          ? parseFloat(token.value)
          : token.value,
        raw: token.value,
        line: token.line,
        column: token.column,
      };
    }

    // Identifier or an input method call
    if (this.check(TokenType.IDENTIFIER)) {
      const identifier = this.parseIdentifier();

      // Check for an input method call
      if (this.check(TokenType.DOT)) {
        this.advance(); // consume .

        const methodToken = this.consume(
          TokenType.IDENTIFIER,
          "Expected method name after '.'",
        );
        if (!methodToken) {
          throw new Error("Missing method name");
        }

        this.consume(TokenType.LPAREN, "Expected '(' after method name");
        this.consume(TokenType.RPAREN, "Expected ')' after '('");

        return {
          type: ASTNodeType.INPUT_METHOD_CALL,
          object: identifier,
          method: methodToken.value,
          line: identifier.line,
          column: identifier.column,
        };
      }

      return identifier;
    }

    // Handle unexpected tokens in an expression
    const token = this.peek();
    this.addError({
      line: token.line,
      column: token.column,
      message: `Unexpected token '${token.value}' in expression`,
      length: token.value.length,
      severity: "error",
    });

    // Return a dummy identifier to allow parsing to continue
    this.advance();
    return {
      type: ASTNodeType.IDENTIFIER,
      name: token.value,
      line: token.line,
      column: token.column,
    };
  }

  // Parses an identifier
  private parseIdentifier(): Identifier {
    const token = this.consume(TokenType.IDENTIFIER, "Expected identifier");
    if (!token) {
      throw new Error("Missing identifier");
    }

    return {
      type: ASTNodeType.IDENTIFIER,
      name: token.value,
      line: token.line,
      column: token.column,
    };
  }

  // Checks if the current token is a type keyword
  private isType(): boolean {
    const typeTokens = [
      TokenType.EDGE,
      TokenType.MARK,
      TokenType.THICK,
      TokenType.THIN,
      TokenType.CREASE,
      TokenType.FLAT,
      TokenType.STRIP,
    ];
    return typeTokens.some((type) => this.check(type));
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

  // Adds a parse error
  private addError(error: ParseError): void {
    this.errors.push(error);
  }

  // Checks the current token's type without consuming it
  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  // Consumes the current token if it matches the expected type, otherwise adds an error
  private consume(type: TokenType, message: string): Token | null {
    if (this.check(type)) {
      return this.advance();
    }

    const token = this.peek();
    this.addError({
      line: token.line,
      column: token.column,
      message: message,
      expected: type,
      found: token.type,
      length: token.value.length,
      severity: "error",
    });

    return null;
  }

  // Advances to the next token and returns the previous one
  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  // Checks if the parser has reached the end of the token stream
  private isAtEnd(): boolean {
    return (
      this.current >= this.tokens.length || this.peek().type === TokenType.EOF
    );
  }

  // Returns the current token without advancing
  private peek(): Token {
    return this.tokens[this.current] || this.tokens[this.tokens.length - 1];
  }

  // Returns the previously consumed token
  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  // Looks ahead n tokens
  private peekAhead(n: number): Token | null {
    const index = this.current + n;
    if (index >= this.tokens.length) return null;
    return this.tokens[index];
  }
}

// Entry point for parsing a list of tokens
export function parse(tokens: Token[]): ParseResult {
  // const parser = new Parser(tokens);
  const parser = new OrigamiParser(tokens);
  return parser.parse();
}
