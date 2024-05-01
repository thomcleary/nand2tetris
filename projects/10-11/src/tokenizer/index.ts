import { Result } from "../types.js";
import { error } from "../utils/index.js";
import { KEYWORDS, SYMBOLS } from "./constants.js";
import { Identifier, Keyword, Symbol, Token } from "./types.js";

export const tokenize = (jackProgram: string[]): Result<{ tokens: readonly Token[] }> => {
  let tokens: Token[] = [];

  for (const line of jackProgram) {
    let head = 0;
    let tail = 0;

    while (tail < line.length) {
      const window = line.slice(head, tail + 1);
      const tailChar = window.charAt(window.length - 1);

      if (window === " ") {
        tail++;
        head = tail;
        continue;
      }

      if (window === '"') {
        const stringConstantEnd = line.indexOf('"', head + 1);

        if (stringConstantEnd < 0) {
          return { success: false, message: error('String constant has no ending "') };
        }

        tokens.push({ type: "stringConstant", token: line.slice(head + 1, stringConstantEnd) });

        tail = stringConstantEnd + 1;
        head = tail;
        continue;
      }

      if (isKeyword(window)) {
        tokens.push({ type: "keyword", token: window });

        tail++;
        head = tail;
        continue;
      }

      if (isSymbol(window)) {
        tokens.push({ type: "symbol", token: window });

        tail++;
        head = tail;
        continue;
      }

      if (isKeyword(tailChar) || isSymbol(tailChar) || tailChar === " ") {
        const identifierOrIntegerConstant = window.slice(0, window.length - 1);

        if (isIntegerConstant(identifierOrIntegerConstant)) {
          tokens.push({ type: "integerConstant", token: identifierOrIntegerConstant });
        } else if (isIdentifier(identifierOrIntegerConstant)) {
          tokens.push({ type: "identifier", token: identifierOrIntegerConstant });
        } else {
          return { success: false, message: error(`Invalid identifier: ${identifierOrIntegerConstant}`) };
        }

        head = tail;
        continue;
      }

      tail++;
    }
  }

  return { success: true, tokens };
};

const isKeyword = (s: string): s is Keyword => {
  const keywords: readonly string[] = KEYWORDS;
  return keywords.includes(s);
};

const isSymbol = (s: string): s is Symbol => {
  const symbols: readonly string[] = SYMBOLS;
  return symbols.includes(s);
};

const isIntegerConstant = (s: string): s is `${number}` => /\d+/g.test(s);

const isIdentifier = (s: string): s is Identifier => /[_a-z][_a-zA-Z0-9]*/g.test(s);

export default tokenize;
