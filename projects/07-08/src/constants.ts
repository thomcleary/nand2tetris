export enum StackCommand {
  Push = "push",
  Pop = "pop",
}

export enum ArithmeticLogicalCommand {
  Add = "add",
  Sub = "sub",
  Neg = "neg",
  Eq = "eq",
  Gt = "gt",
  Lt = "lt",
  And = "and",
  Or = "or",
  Not = "not",
}

export enum BranchCommand {
  Label = "label",
  Goto = "goto",
  IfGoto = "if-goto",
}

export enum FunctionCommand {
  Function = "function",
  Return = "return",
  Call = "call",
}

export enum Segment {
  Argument = "argument",
  Local = "local",
  Static = "static",
  Constant = "constant",
  This = "this",
  That = "that",
  Pointer = "pointer",
  Temp = "temp",
}

export enum Symbol {
  SP = "SP",
  LCL = "LCL",
  ARG = "ARG",
  THIS = "THIS",
  THAT = "THAT",
  R13 = "R13",
  R14 = "R14",
  R15 = "R15",
}

export const TEMP_OFFSET = 5;
