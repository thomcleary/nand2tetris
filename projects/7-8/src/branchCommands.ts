import { BranchCommand } from "./constants.js";
import { AssemblyInstruction, BranchInstruction } from "./types.js";
import { toLabel } from "./utils.js";

export const labelToAssembly = ({
  label,
  fileName,
}: BranchInstruction & { fileName: string }): readonly AssemblyInstruction[] => [`(${toLabel({ fileName, label })})`];

export const gotoToAssembly = ({
  command,
  label,
  fileName,
}: BranchInstruction & { fileName: string }): readonly AssemblyInstruction[] => [
  "@SP",
  "AM=M-1",
  "D=M",
  `@${toLabel({ fileName, label })}`,
  `D;${command === BranchCommand.Goto ? "JMP" : "JNE"}`,
];
