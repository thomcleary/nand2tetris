import { BranchCommand, Symbol } from "./constants.js";
import { AssemblyInstruction, BranchInstruction, ToAssembly } from "./types.js";
import { toLabel } from "./utils.js";

export const labelToAssembly = ({
  vmInstruction: { label },
  context: { fileName, functionName },
}: ToAssembly<BranchInstruction<BranchCommand.Label>>): readonly AssemblyInstruction[] => [
  `(${toLabel({ fileName, functionName, label })})`,
];

export const gotoToAssembly = ({
  vmInstruction: { label },
  context: { fileName, functionName },
}: ToAssembly<BranchInstruction<BranchCommand.Goto>>): readonly AssemblyInstruction[] => [
  `@${toLabel({ fileName, functionName, label })}`,
  "0;JMP",
];

export const ifGotoToAssembly = ({
  vmInstruction: { label },
  context: { fileName, functionName },
}: ToAssembly<BranchInstruction<BranchCommand.IfGoto>>): readonly AssemblyInstruction[] => [
  `@${Symbol.SP}`,
  "AM=M-1",
  "D=M",
  `@${toLabel({ fileName, functionName, label })}`,
  "D;JNE",
];
