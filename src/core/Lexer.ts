enum TokenCategory {
  KEYWORD = "KEYWORD",
  IDENTIFIER = "IDENTIFIER",
  NUMBER = "NUMBER",
  OPERATOR = "OPERATOR",
  PUNCTUATION = "PUNCTUATION",
  STRING = "STRING",
  WHITESPACE = "WHITESPACE",
  COMMENT = "COMMENT",
  UNKNOWN = "UNKNOWN",
}

type TokenType =
  | TokenCategory.KEYWORD
  | TokenCategory.IDENTIFIER
  | TokenCategory.NUMBER
  | TokenCategory.OPERATOR
  | TokenCategory.PUNCTUATION
  | TokenCategory.STRING
  | TokenCategory.WHITESPACE
  | TokenCategory.COMMENT
  | TokenCategory.UNKNOWN;

interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

const KEYWORDS = new Set([
  "corner",
  "mark",
  "grain",
  "bend",
  "crease",
  "flat",
  "pattern",
  "center",
  "valley",
  "mountain",
  "isolate",
  "crimp",
  "pleat",
  "spiral",
  "tear",
  "flip",
  "unfold",
  "smooth",
  "crumple",
  "draft",
  "fold",
  "builds",
  "craft",
  "open",
  "sharp",
  "under",
  "sheet",
  "seal",
  "blank",
]);

const OPERATORS = new Set([
  // Arithmetic Operators
  "+",
  "-",
  "*",
  "/",
  "%",
  "**",
  "++",
  "--",

  // Assignment Operators
  "=",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "**=",

  // Comparison Operators
  "==",
  "!=",
  "<",
  ">",
  "<=",
  ">=",

  // Logical Operators
  "&&",
  "||",
  "!",
]);

const PUNCTUATIONS = new Set([".", ";", ",", "(", ")", "{", "}", "[", "]"]);

function LexicalAnalyzer(input: string): Token[] {
  const tokens: Token[] = [];
  let line = 1;
  let column = 1;
  let i = 0;

  while (i < input.length) {
    const currentChar = input[i] as string;

    // Whitespace
    if (/\s/.test(currentChar)) {
      const start = i;
      const startCol = column;
      while (i < input.length && /\s/.test(input[i] as string)) {
        if (input[i] === "\n") {
          line++;
          column = 1;
        } else {
          column++;
        }
        i++;
      }

      tokens.push({
        type: TokenCategory.WHITESPACE,
        value: input.substring(start, i),
        line,
        column: startCol,
      });

      continue;
    }

    // Comment
    if (currentChar === "/" && input[i + 1] === "/") {
      const start = i;
      const startCol = column;

      while (i < input.length && input[i] !== "\n") {
        i++;
        column++;
      }

      tokens.push({
        type: TokenCategory.COMMENT,
        value: input.substring(start, i),
        line,
        column: startCol,
      });

      continue;
    }

    // Strings
    if (currentChar === '"' || currentChar === "'") {
      const quote = currentChar;
      const start = i;
      const startCol = column;
      i++;
      column++;

      while (i < input.length && input[i] !== quote) {
        if (input[i] === "\\") {
          i++;
          column++;
        }
        if (i < input.length) {
          i++;
          column++;
        }
      }
      if (i < input.length) {
        i++;
        column++;
      }

      tokens.push({
        type: TokenCategory.STRING,
        value: input.substring(start, i),
        line,
        column: startCol,
      });

      continue;
    }

    // Numbers
    if (/\d/.test(currentChar)) {
      const start = i;
      const startCol = column;

      while (i < input.length && /\d/.test(input[i] as string)) {
        i++;
        column++;
      }
      if (i < input.length && input[i] === ".") {
        i++;
        column++;
        while (i < input.length && /\d/.test(input[i] as string)) {
          i++;
          column++;
        }
      }

      tokens.push({
        type: TokenCategory.NUMBER,
        value: input.substring(start, i),
        line,
        column: startCol,
      });

      continue;
    }

    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(currentChar)) {
      const start = i;
      const startCol = column;
      while (i < input.length && /[a-zA-Z0-9_]/.test(input[i] as string)) {
        i++;
        column++;
      }

      const value = input.substring(start, i);
      tokens.push({
        type: KEYWORDS.has(value)
          ? TokenCategory.KEYWORD
          : TokenCategory.IDENTIFIER,
        value,
        line,
        column: startCol,
      });

      continue;
    }

    // Operators
    // Two-character operators
    const twoChar = input.substring(i, i + 2);
    if (OPERATORS.has(twoChar)) {
      tokens.push({
        type: TokenCategory.OPERATOR,
        value: twoChar,
        line,
        column,
      });
      i += 2;
      column += 2;

      continue;
    }

    // Single-character operators
    if (OPERATORS.has(currentChar)) {
      tokens.push({
        type: TokenCategory.OPERATOR,
        value: currentChar,
        line,
        column,
      });
      i++;
      column++;

      continue;
    }

    // Punctuations
    if (PUNCTUATIONS.has(currentChar)) {
      tokens.push({
        type: TokenCategory.PUNCTUATION,
        value: currentChar,
        line,
        column,
      });
      i++;
      column++;
      continue;
    }

    tokens.push({
      type: TokenCategory.UNKNOWN,
      value: currentChar,
      line,
      column,
    });
    i++;
    column++;
  }

  return tokens;
}

console.log(
  LexicalAnalyzer(`open fold Sample
sharp crease counter = 0;
bend rate = 1.5;
mark letter = 'A';
corner flag = true;
flat craft();

mountain(counter < 5) {
    pleat(crease i = 0; i < 3; i++) {
        spiral(flag) {
            flip;
        }
    }
    valley {
        tear;
    }
}

isolate(letter) {
    pattern 'A':
        draft {
            smooth(mark e) {
                crumple e;
            }
        }
        unfold 1;
    pattern 'B':
        unfold 2;
    center:
        unfold 0;
}

crimp {
    counter++;
} spiral(counter < 10);

sheet.counter = sheet.counter + 1;

blank;
seal crease CONST_VAL = 100;

craft Sample2 = under Sample;

`)
);
