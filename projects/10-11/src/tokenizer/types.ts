import { KEYWORDS, SYMBOLS } from "./constants.js";

type Split<T extends string, S extends string = never> = T extends `${infer Head}${infer Tail}`
  ? S | Head | Split<Tail>
  : S;

type Digits = "0123456789";
type Letters = "abcdefghijklmnopqrstuvwxyz";

type _IdentifierChars = Split<`_${Digits}${Letters}`>;
type IdentifierChars = _IdentifierChars | Capitalize<_IdentifierChars>;

export type Keyword = (typeof KEYWORDS)[number];
export type Symbol = (typeof SYMBOLS)[number];
export type Identifier = `${Exclude<IdentifierChars, Split<Digits>>}${string}`;

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
