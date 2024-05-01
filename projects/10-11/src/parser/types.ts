import { Token } from "../tokenizer/types.js";

export type Tree<T> = {
  root: TreeNode<T>;
  insert(value: T): Tree<T>;
};

export type TreeNode<T> = {
  value: T;
  children: Tree<T>[];
};

export type JackParseTreeNodeValue =
  | {
      grammarRule:
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
