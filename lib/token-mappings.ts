import { TokenType } from "@/types";

// Keywords
export const KEYWORDS: Record<string, TokenType> = {
  // Variable types
  edge: TokenType.EDGE,
  mark: TokenType.MARK,
  thick: TokenType.THICK,
  thin: TokenType.THIN,
  crease: TokenType.CREASE,
  flat: TokenType.FLAT,
  Strip: TokenType.STRIP,

  // Control flow
  figure: TokenType.FIGURE,
  center: TokenType.CENTER,
  back: TokenType.BACK,
  front: TokenType.FRONT,
  isolate: TokenType.ISOLATE,

  // Loops
  work: TokenType.WORK,
  layer: TokenType.LAYER,
  spiral: TokenType.SPIRAL,
  as: TokenType.AS,

  // State manipulation
  tear: TokenType.TEAR,
  flip: TokenType.FLIP,
  reveal: TokenType.REVEAL,
  smooth: TokenType.SMOOTH,
  crumple: TokenType.CRUMPLE,

  // Functions & structures
  draft: TokenType.DRAFT,
  craft: TokenType.CRAFT,
  fold: TokenType.FOLD,
  unfold: TokenType.UNFOLD,
  open: TokenType.OPEN,
  inherit: TokenType.INHERIT,
  attach: TokenType.ATTACH,
  out: TokenType.OUT,
  blueprint: TokenType.BLUEPRINT,

  // Declarations
  sheet: TokenType.SHEET,
  guide: TokenType.GUIDE,
  sealed: TokenType.SEALED,
  blank: TokenType.BLANK,

  // Reserved words
  kachi: TokenType.KACHI,

  // Boolean values
  aligned: TokenType.ALIGNED,
  misaligned: TokenType.MISALIGNED,
  under: TokenType.UNDER,
};

// Operators
export const OPERATORS: Record<string, TokenType> = {
  // Three-character operators
  "**=": TokenType.POWER_ASSIGN,

  // Two-character operators
  "**": TokenType.POWER,
  "++": TokenType.INCREMENT,
  "--": TokenType.DECREMENT,
  "+=": TokenType.PLUS_ASSIGN,
  "-=": TokenType.MINUS_ASSIGN,
  "*=": TokenType.MULTIPLY_ASSIGN,
  "/=": TokenType.DIVIDE_ASSIGN,
  "%=": TokenType.MODULO_ASSIGN,
  "==": TokenType.EQUAL,
  "!=": TokenType.NOT_EQUAL,
  "<=": TokenType.LESS_EQUAL,
  ">=": TokenType.GREATER_EQUAL,
  "&&": TokenType.AND,
  "||": TokenType.OR,
  "->": TokenType.ARROW,

  // Single-character operators
  "+": TokenType.PLUS,
  "-": TokenType.MINUS,
  "*": TokenType.MULTIPLY,
  "/": TokenType.DIVIDE,
  "%": TokenType.MODULO,
  "=": TokenType.ASSIGN,
  "<": TokenType.LESS_THAN,
  ">": TokenType.GREATER_THAN,
  "!": TokenType.NOT,
  "?": TokenType.QUESTION,
  ":": TokenType.COLON,
};

// Punctuation
export const PUNCTUATIONS: Record<string, TokenType> = {
  ".": TokenType.DOT,
  ";": TokenType.SEMICOLON,
  ",": TokenType.COMMA,
  "(": TokenType.LPAREN,
  ")": TokenType.RPAREN,
  "{": TokenType.LBRACE,
  "}": TokenType.RBRACE,
  "[": TokenType.LBRACKET,
  "]": TokenType.RBRACKET,
};
