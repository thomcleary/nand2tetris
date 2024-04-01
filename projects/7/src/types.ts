import { ArithmeticLogicalCommand, Segment, StackCommand } from "./constants.js";

export type Result<T extends Record<PropertyKey, unknown>> =
  | ({ success: true } & T)
  | { success: false; message: string };

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

export type VmInstruction = PushInstruction | PopInstruction | ArithmeticLogicalInstruction;

type Enumerate<T extends string, TUnion extends string = T> = [T] extends [never]
  ? T
  : T extends unknown
  ? T | `${T}${Enumerate<Exclude<TUnion, T>>}`
  : never;

type OpPermutations<R extends Register, RUnion extends Register = R> = R extends unknown
  ? `${R}${"+" | "-" | "&" | "|"}${Exclude<RUnion, R>}`
  : never;

type Register = "A" | "D" | "M";

type Dest = Enumerate<"A" | "D" | "M">;
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
