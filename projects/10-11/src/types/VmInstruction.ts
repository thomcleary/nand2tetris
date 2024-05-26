export type Segment = "argument" | "local" | "static" | "constant" | "this" | "that" | "pointer" | "temp";

type PushInstruction = `push ${Segment} ${number}`;

type PopInstruction = `pop ${Exclude<Segment, "constant">} ${number}`;

type FunctionInstruction = `${"function" | "call"} ${string}.${string} ${number}`;

type BranchingInstruction = `${"label" | "goto" | "if-goto"} ${string}`;

type ReturnCommand = "return";

type ArithmeticCommand = "add" | "sub" | "neg";

type ComparisonCommand = "eq" | "gt" | "lt";

type LogicalCommand = "and" | "or" | "not";

export type VmInstruction =
  | PushInstruction
  | PopInstruction
  | FunctionInstruction
  | BranchingInstruction
  | ReturnCommand
  | ArithmeticCommand
  | ComparisonCommand
  | LogicalCommand;
