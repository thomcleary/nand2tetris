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
