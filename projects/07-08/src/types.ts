import { ArithmeticLogicalCommand, BranchCommand, FunctionCommand, Segment, StackCommand } from "./constants.js";

export type Result<T extends Record<PropertyKey, unknown>> =
  | ({ success: true } & T)
  | { success: false; message: string };

export type TranslationContext = {
  fileName: string;
  currentFunction?: string;
  lineNumber?: number;
};

export type ToAssembly<T extends VmInstruction> = {
  vmInstruction: T;
  context: TranslationContext;
};

export type StackInstruction<T extends StackCommand> = {
  command: T;
  segment: T extends StackCommand.Push ? Segment : Exclude<Segment, Segment.Constant>;
  index: number;
};

export type ArithmeticLogicalInstruction = {
  command: ArithmeticLogicalCommand;
};

export type BranchInstruction<T extends BranchCommand> = {
  command: T;
  label: string;
};

export type FunctionInstruction = {
  command: FunctionCommand.Function;
  func: string;
  locals: number;
};

export type ReturnInstruction = {
  command: FunctionCommand.Return;
};

export type CallInstruction = {
  command: FunctionCommand.Call;
  func: string;
  args: number;
};

export type VmInstruction =
  | StackInstruction<StackCommand.Push>
  | StackInstruction<StackCommand.Pop>
  | ArithmeticLogicalInstruction
  | BranchInstruction<BranchCommand.Label>
  | BranchInstruction<BranchCommand.Goto>
  | BranchInstruction<BranchCommand.IfGoto>
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
