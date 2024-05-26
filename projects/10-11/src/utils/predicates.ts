import { JackParseTreeNodeValue } from "../parser/JackParseTree.js";
import { StatementRule } from "../types/GrammarRule.js";
import {
  IdentifierToken,
  IntegerConstantToken,
  KeywordConstantToken,
  OperatorToken,
  StatementKeywordToken,
  StringConstantToken,
  TypeKeywordToken,
  UnaryOperatorToken,
} from "../types/Token.js";

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

export const isStatementRule = (
  v: JackParseTreeNodeValue
): v is {
  type: "grammarRule";
  rule: StatementRule;
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

export const isType = (v: JackParseTreeNodeValue): v is IdentifierToken | TypeKeywordToken => {
  if (v.type === "grammarRule") {
    return false;
  }
  const { type, token } = v;
  const isIntCharOrBoolean = type === "keyword" && (token === "int" || token === "char" || token === "boolean");
  const isClassName = type === "identifier";

  return isIntCharOrBoolean || isClassName;
};

export const isClassVarKeyword = (v: JackParseTreeNodeValue): v is { type: "keyword"; token: "static" | "field" } => {
  if (v.type === "grammarRule") {
    return false;
  }
  const { type, token } = v;
  return type === "keyword" && (token === "static" || token === "field");
};

export const isSeparator = (v: JackParseTreeNodeValue): v is { type: "symbol"; token: "," } => {
  if (v.type === "grammarRule") {
    return false;
  }
  const { type, token } = v;
  return type === "symbol" && token === ",";
};

export const isSubroutineType = (
  v: JackParseTreeNodeValue
): v is { type: "keyword"; token: "constructor" | "function" | "method" } => {
  if (v.type === "grammarRule") {
    return false;
  }
  const { type, token } = v;
  return type === "keyword" && (token === "constructor" || token === "function" || token === "method");
};

export const isStatement = (v: JackParseTreeNodeValue): v is StatementKeywordToken => {
  if (v.type === "grammarRule") {
    return false;
  }
  const { type, token } = v;
  return (
    type === "keyword" &&
    (token === "let" || token === "if" || token === "while" || token === "do" || token === "return")
  );
};

export const isKeywordConstant = (v: JackParseTreeNodeValue): v is KeywordConstantToken => {
  if (v.type === "grammarRule") {
    return false;
  }
  const { type, token } = v;
  return type === "keyword" && (token === "true" || token === "false" || token == "null" || token === "this");
};

export const isOperator = (v: JackParseTreeNodeValue): v is OperatorToken => {
  if (v.type === "grammarRule") {
    return false;
  }
  const { type, token } = v;
  return type === "symbol" && ["+", "-", "*", "/", "&", "|", "<", ">", "="].includes(token);
};

export const isUnaryOperator = (v: JackParseTreeNodeValue): v is UnaryOperatorToken => {
  if (v.type === "grammarRule") {
    return false;
  }
  const { type, token } = v;
  return type === "symbol" && (token === "-" || token === "~");
};
