export type GrammarRule = {
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
};

export type StatementRule = Extract<
  GrammarRule["rule"],
  "letStatement" | "ifStatement" | "whileStatement" | "doStatement" | "returnStatement"
>;
