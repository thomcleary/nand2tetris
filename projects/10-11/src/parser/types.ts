import { Token } from "../tokenizer/types.js";

export type JackParseTreeNodeValue =
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
