import { IdentifierToken, Keyword, KeywordToken, Token } from "../tokenizer/types.js";

type SpecificKeywordToken<T extends Keyword> = KeywordToken & { token: Extract<Keyword, T> };
type TypeKeyword = SpecificKeywordToken<"int" | "char" | "boolean">;
type StatementKeyword = SpecificKeywordToken<"let" | "if" | "while" | "do" | "return">;

export const isTypeToken = (t: Token): t is IdentifierToken | TypeKeyword => {
  const { type, token } = t;
  const isIntCharOrBoolean = type === "keyword" && (token === "int" || token === "char" || token === "boolean");
  const isClassName = type === "identifier";

  return isIntCharOrBoolean || isClassName;
};

export const isStatementToken = (t: Token): t is StatementKeyword => {
  const { type, token } = t;
  return (
    type === "keyword" &&
    (token === "let" || token === "if" || token === "while" || token === "do" || token === "return")
  );
};
