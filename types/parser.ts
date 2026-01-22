export interface ParseError {
  line: number;
  column: number;
  message: string;
  expected?: string;
  found?: string;
  length: number;
  severity: "error" | "warning";
}

// AST Node Types
export enum ASTNodeType {
  PROGRAM = "Program",
  DECLARATION_STATEMENT = "DeclarationStatement",
  INPUT_STATEMENT = "InputStatement",
  DECLARATOR = "Declarator",
  EXPRESSION = "Expression",
  BINARY_EXPRESSION = "BinaryExpression",
  IDENTIFIER = "Identifier",
  LITERAL = "Literal",
  INPUT_METHOD_CALL = "InputMethodCall",
}

export interface ASTNode {
  type: ASTNodeType;
  line: number;
  column: number;
}

export interface Program extends ASTNode {
  type: ASTNodeType.PROGRAM;
  body: Statement[];
}

export type Statement = DeclarationStatement | InputStatement;

export interface DeclarationStatement extends ASTNode {
  type: ASTNodeType.DECLARATION_STATEMENT;
  dataType: string;
  declarators: Declarator[];
}

export interface InputStatement extends ASTNode {
  type: ASTNodeType.INPUT_STATEMENT;
  dataType?: string; // Optional for variable declaration
  identifiers: Identifier[];
  inputMethodCall: InputMethodCall;
}

export interface Declarator extends ASTNode {
  type: ASTNodeType.DECLARATOR;
  identifier: Identifier;
  initializer?: Expression;
}

export interface Identifier extends ASTNode {
  type: ASTNodeType.IDENTIFIER;
  name: string;
}

export interface Literal extends ASTNode {
  type: ASTNodeType.LITERAL;
  value: string | number;
  raw: string;
}

export interface BinaryExpression extends ASTNode {
  type: ASTNodeType.BINARY_EXPRESSION;
  operator: string;
  left: Expression;
  right: Expression;
}

export interface InputMethodCall extends ASTNode {
  type: ASTNodeType.INPUT_METHOD_CALL;
  object: Identifier;
  method: string;
}

export type Expression =
  | BinaryExpression
  | Identifier
  | Literal
  | InputMethodCall;

export interface ParseResult {
  success: boolean;
  errors: ParseError[];
  ast: Program | null;
}
