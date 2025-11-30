export enum TokenType {
  KEYWORD = "KEYWORD",
  IDENTIFIER = "IDENTIFIER",
  NUMBER = "NUMBER",
  STRING = "STRING",
  OPERATOR = "OPERATOR",
  PUNCTUATION = "PUNCTUATION",
  COMMENT = "COMMENT",
  WHITESPACE = "WHITESPACE",
  EOF = "EOF",
  UNKNOWN = "UNKNOWN",
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}
