import { BranchCommand, Symbol } from "../constants.js";
import type { AssemblyInstruction, BranchInstruction, ToAssembly } from "../types.js";
import { toLabel } from "../utils.js";

export const labelToAssembly = ({
  vmInstruction: { label },
  context: { fileName, currentFunction },
}: ToAssembly<BranchInstruction<BranchCommand.Label>>): readonly AssemblyInstruction[] => [
  `(${toLabel({ fileName, functionName: currentFunction, label })})`,
];

export const gotoToAssembly = ({
  vmInstruction: { label },
  context: { fileName, currentFunction },
}: ToAssembly<BranchInstruction<BranchCommand.Goto>>): readonly AssemblyInstruction[] => [
  `@${toLabel({ fileName, functionName: currentFunction, label })}`,
  "0;JMP",
];

export const ifGotoToAssembly = ({
  vmInstruction: { label },
  context: { fileName, currentFunction },
}: ToAssembly<BranchInstruction<BranchCommand.IfGoto>>): readonly AssemblyInstruction[] => [
  `@${Symbol.SP}`,
  "AM=M-1",
  "D=M",
  `@${toLabel({ fileName, functionName: currentFunction, label })}`,
  "D;JNE",
];
