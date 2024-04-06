import { BranchCommand } from "./constants.js";
import { AssemblyInstruction, GotoInstruction, LabelInstruction, TranslationContext } from "./types.js";
import { toLabel } from "./utils.js";

// TODO:
// - Labels within functions must have the form FileName.FunctionName$Label
//   and goto/ifgoto commands within the function must use this label
export const labelToAssembly = ({
  instruction: { label },
  context: { fileName },
}: {
  instruction: LabelInstruction;
  context: TranslationContext;
}): readonly AssemblyInstruction[] => [`(${toLabel({ fileName, label })})`];

export const gotoToAssembly = ({
  instruction: { command, label },
  context: { fileName },
}: {
  instruction: GotoInstruction;
  context: TranslationContext;
}): readonly AssemblyInstruction[] => [
  "@SP",
  "AM=M-1",
  "D=M",
  `@${toLabel({ fileName, label })}`,
  `D;${command === BranchCommand.Goto ? "JMP" : "JNE"}`,
];
