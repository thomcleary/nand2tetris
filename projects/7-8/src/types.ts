import { ArithmeticLogicalCommand, BranchCommand, FunctionCommand, Segment, StackCommand } from "./constants.js";

export type Result<T extends Record<PropertyKey, unknown>> =
  | ({ success: true } & T)
  | { success: false; message: string };

export type TranslationContext = {
  fileName: string;
  functionName: string | undefined;
  lineNumber: number;
};

export type ToAssembly<T extends VmInstruction> = {
  vmInstruction: T;
  context: TranslationContext;
};

export type PushInstruction = {
  command: StackCommand.Push;
  segment: Segment;
  index: number;
};

export type PopInstruction = {
  command: StackCommand.Pop;
  segment: Exclude<Segment, Segment.Constant>;
  index: number;
};

export type ArithmeticLogicalInstruction = {
  command: ArithmeticLogicalCommand;
};

export type LabelInstruction = {
  command: BranchCommand.Label;
  label: string;
};

export type GotoInstruction = {
  command: BranchCommand.Goto | BranchCommand.IfGoto;
  label: string;
};

export type FunctionInstruction = {
  command: FunctionCommand.Function;
  functionName: string;
  locals: number;
};

export type ReturnInstruction = {
  command: FunctionCommand.Return;
};

export type CallInstruction = {
  command: FunctionCommand.Call;
  functionName: string;
  args: number;
};

export type VmInstruction =
  | PushInstruction
  | PopInstruction
  | ArithmeticLogicalInstruction
  | LabelInstruction
  | GotoInstruction
  | FunctionInstruction
  | ReturnInstruction
  | CallInstruction;

type Permutations<T extends string, TUnion extends string = T> = [T] extends [never]
  ? T
  : T extends unknown
  ? T | `${T}${Permutations<Exclude<TUnion, T>>}`
  : never;

type OpPermutations<R extends Register, RUnion extends Register = R> = R extends unknown
  ? `${R}${"+" | "-" | "&" | "|"}${Exclude<RUnion, R>}`
  : never;

type Register = "A" | "D" | "M";

type Dest = Permutations<Register>;
type Comp =
  | "0"
  | "1"
  | "-1"
  | Register
  | `${"!" | "-"}${Register}`
  | `${Register}${"+" | "-"}1`
  | OpPermutations<"D" | "A">
  | OpPermutations<"D" | "M">;
type Jump = "JGT" | "JEQ" | "JGE" | "JLT" | "JNE" | "JLE" | "JMP";

type Comment = `//${string}`;
type Label = `(${string})`;
type AInstruction = `@${string | number}`;
type CInstruction = Comp | `${Dest}=${Comp}` | `${Comp};${Jump}` | `${Dest}=${Comp};${Jump}`;

export type AssemblyInstruction = Comment | Label | AInstruction | CInstruction;
