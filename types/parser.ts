import { ExportPageInput } from "next/dist/export/types";

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
  UNARY_EXPRESSION = "UnaryExpression",
  IDENTIFIER = "Identifier",
  LITERAL = "Literal",
  INPUT_METHOD_CALL = "InputMethodCall",
  POSTFIX = "Postfix",
  PREFIX = "Prefix",

  CONDITIONAL_STATEMENT = "ConditionalStatement",
  WHILE_STATEMENT = "WhileStatement",
  DO_WHILE_STATEMENT = "DoWhileStatement",
  FOR_STATEMENT = "ForStatement",
  FOREACH_STATEMENT = "ForEachStatement",

  ERROR_STATEMENT = "ErrorStatement",
  ASSIGNMENT_STATEMENT = "AssignmentStatement",

  CLASS_DECLARATION = "ClassDeclaration",
  METHOD_DECLARATION = "MethodDeclaration",
  PARAMETER = "Parameter",
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

export type Statement =
  | DeclarationStatement
  | InputStatement
  | ConditionalStatement
  | WhileStatement
  | DoWhileStatement
  | ForStatement
  | ForEachStatement
  | ErrorStatement
  | AssignmentStatement
  | ClassDeclaration;

export interface ErrorStatement extends ASTNode {
  type: ASTNodeType.ERROR_STATEMENT;
}

export interface DeclarationStatement extends ASTNode {
  type: ASTNodeType.DECLARATION_STATEMENT;
  dataType: string;
  declarators: Declarator[];
}

export interface AssignmentStatement extends ASTNode {
  type: ASTNodeType.ASSIGNMENT_STATEMENT;
  identifier: Identifier;
  value: Expression;
}

export interface ConditionalStatement extends ASTNode {
  type: ASTNodeType.CONDITIONAL_STATEMENT;
  branches: {
    condition: Expression | null;
    body: Statement[];
  }[];
}

export interface WhileStatement extends ASTNode {
  type: ASTNodeType.WHILE_STATEMENT;
  condition: Expression;
  body: Statement[];
}

export interface DoWhileStatement extends ASTNode {
  type: ASTNodeType.DO_WHILE_STATEMENT;
  body: Statement[];
  condition: Expression;
}

export interface ForStatement extends ASTNode {
  type: ASTNodeType.FOR_STATEMENT;
  init: Statement | null;
  condition: Expression | null;
  update: Expression[];
  body: Statement[];
}

export interface ForEachStatement extends ASTNode {
  type: ASTNodeType.FOREACH_STATEMENT;
  varType: string;
  identifier: string;
  iterable: Expression;
  body: Statement[];
}

export interface InputStatement extends ASTNode {
  type: ASTNodeType.INPUT_STATEMENT;
  dataType?: string; // Optional for variable declaration
  identifiers: Identifier[];
  inputMethodCall: InputMethodCall;
}

export type Expression =
  | BinaryExpression
  | Identifier
  | Literal
  | InputMethodCall
  | UnaryExpression
  | PostfixExpression
  | PrefixExpression;

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

export interface UnaryExpression extends ASTNode {
  type: ASTNodeType.UNARY_EXPRESSION;
  operator: string;
  expr: Expression;
}

export interface InputMethodCall extends ASTNode {
  type: ASTNodeType.INPUT_METHOD_CALL;
  object: Identifier;
  method: string;
}

export interface PostfixExpression extends ASTNode {
  type: ASTNodeType.POSTFIX;
  expr: Expression;
  operator: string;
}
export interface PrefixExpression extends ASTNode {
  type: ASTNodeType.PREFIX;
  expr: Expression;
  operator: string;
}

export interface ParseResult {
  success: boolean;
  errors: ParseError[];
  ast: Program | null;
}

export type StatementParserFn = () => Statement | null;

export interface Parameter extends ASTNode {
  type: ASTNodeType.PARAMETER;
  dataType: string;
  name: string;
  isArray: boolean;
}

export interface MethodDeclaration extends ASTNode {
  type: ASTNodeType.METHOD_DECLARATION;
  modifiers: string[]; // e.g., ["open", "guide"]
  returnType: string;
  name: string;
  parameters: Parameter[];
  body: Statement[];
}

export interface ClassDeclaration extends ASTNode {
  type: ASTNodeType.CLASS_DECLARATION;
  modifiers: string[]; // e.g., ["open"]
  name: string;
  superClass?: string;
  methods: MethodDeclaration[];
  fields: DeclarationStatement[];
}
