import { Token } from "../tokenizer/types.js";

export type ParseTree<T> = {
  root: ParseTreeNode<T>;
  insert(value: T): void;
  toXmlString(options: { depth?: number }): string;
};

export type ParseTreeNode<T> = {
  value: T;
  children: ParseTree<T>[];
};

export type JackParseTreeNode =
  | {
      type: "grammarRule";
      rule:
        | "class"
        | "classVarDec"
        | "type"
        | "subroutineDec"
        | "parameterList"
        | "subroutineBody"
        | "varDec"
        | "className"
        | "subroutineName"
        | "varName"
        | "statement"
        | "statements"
        | "letStatement"
        | "ifStatement"
        | "whileStatement"
        | "doStatement"
        | "returnStatement"
        | "expression"
        | "term"
        | "subroutineCall"
        | "expressionList"
        | "op"
        | "unaryOp"
        | "keywordConstant";
    }
  | Token;
