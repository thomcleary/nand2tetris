import { IdentifierToken, Keyword, KeywordToken, Token } from "../tokenizer/types.js";
import { JackParseTreeNodeValue } from "./types.js";

type SpecificKeywordToken<T extends Keyword> = KeywordToken & { token: Extract<Keyword, T> };
type TypeKeywordToken = SpecificKeywordToken<"int" | "char" | "boolean">;
type StatementKeywordToken = SpecificKeywordToken<"let" | "if" | "while" | "do" | "return">;

export const isTypeToken = (t: JackParseTreeNodeValue): t is IdentifierToken | TypeKeywordToken => {
  if (t.type === "grammarRule") {
    return false;
  }
  const { type, token } = t;
  const isIntCharOrBoolean = type === "keyword" && (token === "int" || token === "char" || token === "boolean");
  const isClassName = type === "identifier";

  return isIntCharOrBoolean || isClassName;
};

export const isClassVarKeywordToken = (t: Token): t is { type: "keyword"; token: "static" | "field" } => {
  const { type, token } = t;
  return type === "keyword" && (token === "static" || token === "field");
};

export const isSeparatorToken = (t: Token): t is { type: "symbol"; token: "," } => {
  const { type, token } = t;
  return type === "symbol" && token === ",";
};

export const isSubroutineTypeToken = (
  t: Token
): t is { type: "keyword"; token: "constructor" | "function" | "method" } => {
  const { type, token } = t;
  return type === "keyword" && (token === "constructor" || token === "function" || token === "method");
};

export const isStatementToken = (t: Token): t is StatementKeywordToken => {
  const { type, token } = t;
  return (
    type === "keyword" &&
    (token === "let" || token === "if" || token === "while" || token === "do" || token === "return")
  );
};

export const isKeywordConstantToken = (
  t: Token
): t is { type: "keyword"; token: "true" | "false" | "null" | "this" } => {
  const { type, token } = t;
  return type === "keyword" && (token === "true" || token === "false" || token == "null" || token === "this");
};

export const isOperatorToken = (
  t: Token
): t is { type: "symbol"; token: "+" | "-" | "*" | "/" | "&" | "|" | "<" | ">" | "=" } => {
  const { type, token } = t;
  return type === "symbol" && ["+", "-", "*", "/", "&", "|", "<", ">", "="].includes(token);
};

export const isUnaryOperatorToken = (t: Token): t is { type: "symbol"; token: "-" | "~" } => {
  const { type, token } = t;
  return type === "symbol" && (token === "-" || token === "~");
};
