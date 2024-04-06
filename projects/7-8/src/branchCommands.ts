import { BranchCommand } from "./constants.js";
import { AssemblyInstruction, GotoInstruction, LabelInstruction, ToAssembly } from "./types.js";
import { toLabel } from "./utils.js";

// TODO:
// - Labels within functions must have the form FileName.FunctionName$Label
//   and goto/ifgoto commands within the function must use this label
export const labelToAssembly = ({
  vmInstruction: { label },
  context: { fileName },
}: ToAssembly<LabelInstruction>): readonly AssemblyInstruction[] => [`(${toLabel({ fileName, label })})`];

export const gotoToAssembly = ({
  vmInstruction: { command, label },
  context: { fileName },
}: ToAssembly<GotoInstruction>): readonly AssemblyInstruction[] => [
  "@SP",
  "AM=M-1",
  "D=M",
  `@${toLabel({ fileName, label })}`,
  `D;${command === BranchCommand.Goto ? "JMP" : "JNE"}`,
];
