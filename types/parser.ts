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
  BOUNDED_ITERATION = "BoundedIteration",

  ERROR_STATEMENT = "ErrorStatement",
  ASSIGNMENT_STATEMENT = "AssignmentStatement",

  CLASS_DECLARATION = "ClassDeclaration",
  METHOD_DECLARATION = "MethodDeclaration",
  PARAMETER = "Parameter",

  FUNCTION_DECLARATION = "FunctionDeclaration",
  FUNCTION_ATTACHMENT = "FunctionAttachment",
  TEMPLATE_LITERAL = "TemplateLiteral",
  TEMPLATE_ELEMENT = "TemplateElement",
  ARROW_EXPRESSION = "ArrowExpression",
  RETURN_STATEMENT = "ReturnStatement",

  // Try-catch (draft/smooth)
  TRY_STATEMENT = "TryStatement",
  CATCH_CLAUSE = "CatchClause",

  // Throw (crumple)
  THROW_STATEMENT = "ThrowStatement",

  // Object instantiation (craft)
  NEW_EXPRESSION = "NewExpression",

  // Member access (obj.field)
  MEMBER_EXPRESSION = "MemberExpression",

  // Method/function call
  CALL_EXPRESSION = "CallExpression",

  // Expression as statement
  EXPRESSION_STATEMENT = "ExpressionStatement",

  // Member assignment (e.g., sheet.balance = value)
  MEMBER_ASSIGNMENT = "MemberAssignment",
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
  | BoundedIteration
  | ErrorStatement
  | AssignmentStatement
  | MemberAssignment
  | ClassDeclaration
  | FunctionDeclaration
  | ReturnStatement
  | TryStatement
  | ThrowStatement
  | ExpressionStatement;

export interface ErrorStatement extends ASTNode {
  type: ASTNodeType.ERROR_STATEMENT;
}

export interface DeclarationStatement extends ASTNode {
  type: ASTNodeType.DECLARATION_STATEMENT;
  dataType: string;
  isNullable?: boolean;
  modifiers?: string[];
  declarators: Declarator[];
}

export interface AssignmentStatement extends ASTNode {
  type: ASTNodeType.ASSIGNMENT_STATEMENT;
  identifier: Identifier;
  value: Expression;
}

// Member assignment: sheet.balance = value or obj.field = value
export interface MemberAssignment extends ASTNode {
  type: ASTNodeType.MEMBER_ASSIGNMENT;
  target: Expression; // MemberExpression or Identifier
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

// Bounded iteration: layer (5) as i fold ... unfold
export interface BoundedIteration extends ASTNode {
  type: ASTNodeType.BOUNDED_ITERATION;
  count: Expression;
  iterator: string;
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
  | PrefixExpression
  | TemplateLiteralExpr
  | ArrowExpression
  | NewExpression
  | MemberExpression
  | CallExpression;

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
  value: string | number | null;
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
  isNullable?: boolean;
  defaultValue?: Expression;
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

// Function declaration: crease funcName(params) fold ... unfold
export interface FunctionDeclaration extends ASTNode {
  type: ASTNodeType.FUNCTION_DECLARATION;
  returnType: string;
  isNullable?: boolean;
  name: string;
  parameters: Parameter[];
  body: Statement[];
  attachment?: FunctionAttachment;
}

// Function attachment: crease addFive attach double()
export interface FunctionAttachment extends ASTNode {
  type: ASTNodeType.FUNCTION_ATTACHMENT;
  functionName: string;
  arguments: Expression[];
}

// Template literal: "Hello ${name}"
export interface TemplateLiteralExpr extends ASTNode {
  type: ASTNodeType.TEMPLATE_LITERAL;
  parts: (TemplateElement | Expression)[];
}

export interface TemplateElement extends ASTNode {
  type: ASTNodeType.TEMPLATE_ELEMENT;
  value: string;
  raw: string;
}

// Arrow expression for function attachment output: double -> out
export interface ArrowExpression extends ASTNode {
  type: ASTNodeType.ARROW_EXPRESSION;
  left: Identifier;
  right: Identifier;
}

// Return statement: reveal x * 2
export interface ReturnStatement extends ASTNode {
  type: ASTNodeType.RETURN_STATEMENT;
  argument: Expression | null;
}

// Try-catch: draft fold ... unfold smooth (Type param) fold ... unfold
export interface TryStatement extends ASTNode {
  type: ASTNodeType.TRY_STATEMENT;
  body: Statement[];
  handler: CatchClause | null;
}

export interface CatchClause extends ASTNode {
  type: ASTNodeType.CATCH_CLAUSE;
  param: Parameter | null;
  body: Statement[];
}

// Throw statement: crumple "error message"
export interface ThrowStatement extends ASTNode {
  type: ASTNodeType.THROW_STATEMENT;
  argument: Expression;
}

// Object instantiation: craft ClassName(args)
export interface NewExpression extends ASTNode {
  type: ASTNodeType.NEW_EXPRESSION;
  callee: Identifier;
  arguments: Expression[];
}

// Member access: obj.field or sheet.balance
export interface MemberExpression extends ASTNode {
  type: ASTNodeType.MEMBER_EXPRESSION;
  object: Expression;
  property: Identifier;
}

// Method/function call: func(args)
export interface CallExpression extends ASTNode {
  type: ASTNodeType.CALL_EXPRESSION;
  callee: Expression;
  arguments: Expression[];
}

// Expression as statement (e.g., method call)
export interface ExpressionStatement extends ASTNode {
  type: ASTNodeType.EXPRESSION_STATEMENT;
  expression: Expression;
}
