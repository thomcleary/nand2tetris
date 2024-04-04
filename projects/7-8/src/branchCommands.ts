import { AssemblyInstruction, BranchInstruction } from "./types.js";

export const labelToAssembly = ({ label }: BranchInstruction): readonly AssemblyInstruction[] => [`(${label})`];

export const ifGotoToAssembly = ({ label }: BranchInstruction): readonly AssemblyInstruction[] => [
  "@SP",
  "AM=M-1",
  "D=M",
  `@${label}`,
  "D;JNE",
];
