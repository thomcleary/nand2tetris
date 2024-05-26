import { JackParseTreeNodeValue } from "../parser/types.js";
import { IdentifierToken, IntegerConstantToken, StringConstantToken } from "../tokenizer/types.js";

// TODO: organize types and utils with rest of project

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

type NodeType = Exclude<JackParseTreeNodeValue, IdentifierToken | IntegerConstantToken | StringConstantToken>;
type Multiple<T> = [T, T, ...T[]];

export const isNode = <T extends NodeType>(node: JackParseTreeNodeValue, expected: T | Multiple<T>): node is T => {
  if (expected instanceof Array) {
    for (const exp of expected) {
      if (_isNode(node, exp)) {
        return true;
      }
    }
    return false;
  }

  return _isNode(node, expected);
};

export const _isNode = <T extends NodeType>(node: JackParseTreeNodeValue, expected: T): node is T => {
  if (node.type !== "grammarRule" && expected.type !== "grammarRule") {
    const typeMatch = node.type === expected.type;
    const tokenMatch = node.token === expected.token;
    return typeMatch && tokenMatch;
  }

  if (node.type === "grammarRule" && expected.type === "grammarRule") {
    return node.rule === expected.rule;
  }

  return false;
};
