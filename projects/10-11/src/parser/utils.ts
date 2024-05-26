import { IdentifierToken, Keyword, KeywordToken, Token } from "../tokenizer/types.js";
import { JackParseTreeNodeValue } from "./types.js";

type SpecificKeywordToken<T extends Keyword> = KeywordToken & { token: Extract<Keyword, T> };
type TypeKeywordToken = SpecificKeywordToken<"int" | "char" | "boolean">;
type StatementKeywordToken = SpecificKeywordToken<"let" | "if" | "while" | "do" | "return">;

// TODO: move these into a shared types file
export type Operator = "+" | "-" | "*" | "/" | "&" | "|" | "<" | ">" | "=";
export type UnaryOperator = "-" | "~";
export type KeywordConstantToken = { type: "keyword"; token: "true" | "false" | "null" | "this" };
export type UnaryOperatorToken = { type: "symbol"; token: UnaryOperator };

// TODO: refactor / move these utils into shared utils folder

export const isTypeToken = (v: JackParseTreeNodeValue): v is IdentifierToken | TypeKeywordToken => {
  if (v.type === "grammarRule") {
    return false;
  }
  const { type, token } = v;
  const isIntCharOrBoolean = type === "keyword" && (token === "int" || token === "char" || token === "boolean");
  const isClassName = type === "identifier";

  return isIntCharOrBoolean || isClassName;
};

export const isClassVarKeywordToken = (
  v: JackParseTreeNodeValue
): v is { type: "keyword"; token: "static" | "field" } => {
  if (v.type === "grammarRule") {
    return false;
  }
  const { type, token } = v;
  return type === "keyword" && (token === "static" || token === "field");
};

export const isSeparatorToken = (t: Token): t is { type: "symbol"; token: "," } => {
  const { type, token } = t;
  return type === "symbol" && token === ",";
};

export const isSubroutineTypeToken = (
  v: JackParseTreeNodeValue
): v is { type: "keyword"; token: "constructor" | "function" | "method" } => {
  if (v.type === "grammarRule") {
    return false;
  }
  const { type, token } = v;
  return type === "keyword" && (token === "constructor" || token === "function" || token === "method");
};

export const isStatementToken = (t: Token): t is StatementKeywordToken => {
  const { type, token } = t;
  return (
    type === "keyword" &&
    (token === "let" || token === "if" || token === "while" || token === "do" || token === "return")
  );
};

export const isKeywordConstantToken = (v: JackParseTreeNodeValue): v is KeywordConstantToken => {
  if (v.type === "grammarRule") {
    return false;
  }
  const { type, token } = v;
  return type === "keyword" && (token === "true" || token === "false" || token == "null" || token === "this");
};

export const isOperatorToken = (v: JackParseTreeNodeValue): v is { type: "symbol"; token: Operator } => {
  if (v.type === "grammarRule") {
    return false;
  }
  const { type, token } = v;
  return type === "symbol" && ["+", "-", "*", "/", "&", "|", "<", ">", "="].includes(token);
};

export const isUnaryOperatorToken = (v: JackParseTreeNodeValue): v is UnaryOperatorToken => {
  if (v.type === "grammarRule") {
    return false;
  }
  const { type, token } = v;
  return type === "symbol" && (token === "-" || token === "~");
};
