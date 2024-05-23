type Segment = "argument" | "local" | "static" | "constant" | "this" | "that" | "pointer" | "temp";

type PushInstruction = `push ${Segment} ${number}`;

type PopInstruction = `pop ${Exclude<Segment, "constant">} ${number}`;

type CallCommand = `call ${string}.${string} ${number}`;

type FunctionCommand = `function ${string}.${string} ${number}`;

type ReturnCommand = "return";

type ArithmeticCommand = "add" | "sub" | "neg";

type ComparisonCommand = "eq" | "gt" | "lt";

type LogicalCommand = "and" | "or" | "not";

export type VmInstruction =
  | PushInstruction
  | PopInstruction
  | CallCommand
  | FunctionCommand
  | ReturnCommand
  | ArithmeticCommand
  | ComparisonCommand
  | LogicalCommand;
