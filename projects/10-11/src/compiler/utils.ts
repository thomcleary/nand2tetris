import { JackParseTreeNodeValue } from "../parser/types.js";

// TODO: move this type into shared types.ts
export type Statement = "letStatement" | "ifStatement" | "whileStatement" | "doStatement" | "returnStatement";

// TODO: move these into a shared /utils location with parser utils
export const isStatementRule = (
  v: JackParseTreeNodeValue
): v is {
  type: "grammarRule";
  rule: Statement;
} => {
  if (v.type !== "grammarRule") {
    return false;
  }
  const { rule } = v;
  return (
    rule === "letStatement" ||
    rule === "ifStatement" ||
    rule === "whileStatement" ||
    rule === "doStatement" ||
    rule === "returnStatement"
  );
};
