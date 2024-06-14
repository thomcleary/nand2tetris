import { KEYWORDS, SYMBOLS } from "../constants.js";
import type { Split } from "./index.js";

type Digits = "0123456789";
type Letters = "abcdefghijklmnopqrstuvwxyz";

type _IdentifierChars = Split<`_${Digits}${Letters}`>;
type IdentifierChars = _IdentifierChars | Capitalize<_IdentifierChars>;

export type Keyword = (typeof KEYWORDS)[number];
export type Symbol = (typeof SYMBOLS)[number];
export type Identifier = `${Exclude<IdentifierChars, Split<Digits>>}${string}`;

export type KeywordConstant = Extract<Keyword, "true" | "false" | "null" | "this">;
export type TypeKeyword = Extract<Keyword, "int" | "char" | "boolean">;
export type StatementKeyword = Extract<Keyword, "let" | "if" | "while" | "do" | "return">;
export type Operator = Extract<Symbol, "+" | "-" | "*" | "/" | "&" | "|" | "<" | ">" | "=">;
export type UnaryOperator = Extract<Symbol, "-" | "~">;

export type KeywordToken = {
  type: "keyword";
  token: Keyword;
};

export type SymbolToken = {
  type: "symbol";
  token: Symbol;
};

export type IdentifierToken = {
  type: "identifier";
  token: Identifier;
};

export type IntegerConstantToken = {
  type: "integerConstant";
  token: `${number}`;
};

export type StringConstantToken = {
  type: "stringConstant";
  token: string;
};

export type Token = KeywordToken | SymbolToken | IdentifierToken | IntegerConstantToken | StringConstantToken;

type ExtractFromToken<T extends Token, E extends Extract<Token, T>["token"]> = T & { token: Extract<T["token"], E> };
export type ExtractKeywordToken<T extends Keyword> = ExtractFromToken<KeywordToken, T>;

export type KeywordConstantToken = ExtractFromToken<KeywordToken, KeywordConstant>;
export type TypeKeywordToken = ExtractFromToken<KeywordToken, TypeKeyword>;
export type StatementKeywordToken = ExtractFromToken<KeywordToken, StatementKeyword>;
export type OperatorToken = ExtractFromToken<SymbolToken, Operator>;
export type UnaryOperatorToken = ExtractFromToken<SymbolToken, UnaryOperator>;
