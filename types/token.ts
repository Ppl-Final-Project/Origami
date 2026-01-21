export enum TokenType {
  // Variable type keywords
  EDGE = "EDGE",
  MARK = "MARK",
  THICK = "THICK",
  THIN = "THIN",
  CREASE = "CREASE",
  FLAT = "FLAT",
  STRIP = "STRIP",

  // Control flow keywords
  FIGURE = "FIGURE",
  CENTER = "CENTER",
  BACK = "BACK",
  FRONT = "FRONT",
  ISOLATE = "ISOLATE",

  // Loop keywords
  WORK = "WORK",
  LAYER = "LAYER",
  SPIRAL = "SPIRAL",
  AS = "AS",

  // State manipulation keywords
  TEAR = "TEAR",
  FLIP = "FLIP",
  REVEAL = "REVEAL",
  SMOOTH = "SMOOTH",
  CRUMPLE = "CRUMPLE",

  // Function & structure keywords
  DRAFT = "DRAFT",
  CRAFT = "CRAFT",
  FOLD = "FOLD",
  UNFOLD = "UNFOLD",
  OPEN = "OPEN",
  INHERIT = "INHERIT",
  ATTACH = "ATTACH",
  OUT = "OUT",
  BLUEPRINT = "BLUEPRINT",

  // Declaration keywords
  SHEET = "SHEET",
  GUIDE = "GUIDE",
  SEALED = "SEALED",
  BLANK = "BLANK",

  // Boolean literals
  ALIGNED = "ALIGNED",
  MISALIGNED = "MISALIGNED",
  UNDER = "UNDER",

  // Arithmetic operators
  PLUS = "PLUS",
  MINUS = "MINUS",
  MULTIPLY = "MULTIPLY",
  DIVIDE = "DIVIDE",
  MODULO = "MODULO",
  POWER = "POWER",

  // Increment/Decrement
  INCREMENT = "INCREMENT",
  DECREMENT = "DECREMENT",

  // Assignment operators
  ASSIGN = "ASSIGN",
  PLUS_ASSIGN = "PLUS_ASSIGN",
  MINUS_ASSIGN = "MINUS_ASSIGN",
  MULTIPLY_ASSIGN = "MULTIPLY_ASSIGN",
  DIVIDE_ASSIGN = "DIVIDE_ASSIGN",
  MODULO_ASSIGN = "MODULO_ASSIGN",
  POWER_ASSIGN = "POWER_ASSIGN",

  // Comparison operators
  EQUAL = "EQUAL",
  NOT_EQUAL = "NOT_EQUAL",
  LESS_THAN = "LESS_THAN",
  GREATER_THAN = "GREATER_THAN",
  LESS_EQUAL = "LESS_EQUAL",
  GREATER_EQUAL = "GREATER_EQUAL",

  // Logical operators
  AND = "AND",
  OR = "OR",
  NOT = "NOT",

  // Special operators
  ARROW = "ARROW",
  QUESTION = "QUESTION",
  COLON = "COLON",

  // Punctuation/Separators
  DOT = "DOT",
  SEMICOLON = "SEMICOLON",
  COMMA = "COMMA",
  LPAREN = "LPAREN",
  RPAREN = "RPAREN",
  LBRACE = "LBRACE",
  RBRACE = "RBRACE",
  LBRACKET = "LBRACKET",
  RBRACKET = "RBRACKET",

  // Literals
  IDENTIFIER = "IDENTIFIER",
  NUMBER = "NUMBER",
  STRING = "STRING",
  TEMPLATE_LITERAL = "TEMPLATE_LITERAL",

  // Reserved words
  KACHI = "KACHI",

  // Special tokens
  EOF = "EOF",
  UNKNOWN = "UNKNOWN",
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}
