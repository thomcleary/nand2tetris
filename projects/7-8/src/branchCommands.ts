import { BranchCommand, Symbol } from "./constants.js";
import { AssemblyInstruction, GotoInstruction, LabelInstruction, ToAssembly } from "./types.js";
import { toLabel } from "./utils.js";

export const labelToAssembly = ({
  vmInstruction: { label },
  context: { fileName, functionName },
}: ToAssembly<LabelInstruction>): readonly AssemblyInstruction[] => [`(${toLabel({ fileName, functionName, label })})`];

export const gotoToAssembly = ({
  vmInstruction: { command, label },
  context: { fileName, functionName },
}: ToAssembly<GotoInstruction>): readonly AssemblyInstruction[] => [
  // TODO: Don't pop a value off the stack if command is goto
  // only pop off for ifgoto
  // Then try NestedCall.tst again
  `@${Symbol.SP}`,
  "AM=M-1",
  "D=M",
  `@${toLabel({ fileName, functionName, label })}`,
  `D;${command === BranchCommand.Goto ? "JMP" : "JNE"}`,
];
