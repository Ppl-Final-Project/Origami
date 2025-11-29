export enum TokenCategory {
  PRIMITIVE = "PRIMITIVE_DATA",
  CONDITIONAL = "CONDITIONAL_STATEMENT",
  LOOP = "LOOP",
  JUMP = "JUMP STATEMENT",
  EXCEPTION = "EXCEPTION_HANDLING",
  STRUCTURE = "STRUCTURE",
  VARIABLE = "VARIABLE_MODIFIER",
  VALUE = "VALUE",
  IDENTIFIER = "IDENTIFIER",
  NUMBER = "NUMBER",
  OPERATOR = "OPERATOR",
  PUNCTUATION = "PUNCTUATION",
  STRING = "STRING",
  FUNCTION = "FUNCTION",
  COMMENT = "COMMENT",
  UNKNOWN = "UNKNOWN",
  UNKNOWN_IDENTIFIER = "UNKNOWN_IDENTIFIER",
}

export type TokenType =
  | TokenCategory.PRIMITIVE
  | TokenCategory.CONDITIONAL
  | TokenCategory.LOOP
  | TokenCategory.JUMP
  | TokenCategory.EXCEPTION
  | TokenCategory.STRUCTURE
  | TokenCategory.VARIABLE
  | TokenCategory.VALUE
  | TokenCategory.IDENTIFIER
  | TokenCategory.NUMBER
  | TokenCategory.OPERATOR
  | TokenCategory.PUNCTUATION
  | TokenCategory.STRING
  | TokenCategory.FUNCTION
  | TokenCategory.COMMENT
  | TokenCategory.UNKNOWN
  | TokenCategory.UNKNOWN_IDENTIFIER;

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}
