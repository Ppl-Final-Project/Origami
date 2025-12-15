export enum TokenType {
  KEYWORD = "KEYWORD",
  IDENTIFIER = "IDENTIFIER",
  NUMBER = "NUMBER",
  STRING = "STRING",
  OPERATOR = "OPERATOR",
  SEPARATOR = "SEPARATOR",
  COMMENT = "COMMENT",
  WHITESPACE = "WHITESPACE",
  EOF = "EOF",
  UNKNOWN = "UNKNOWN",
  TEMPLATE_LITERAL = "TEMPLATE_LITERAL",
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}
