import { Token } from "../tokenizer/types.js";

export const isTypeToken = ({ type, token }: Token) => {
  const isIntCharOrBoolean = type === "keyword" && (token === "int" || token === "char" || token === "boolean");
  const isClassName = type === "identifier";

  return isIntCharOrBoolean || isClassName;
};
