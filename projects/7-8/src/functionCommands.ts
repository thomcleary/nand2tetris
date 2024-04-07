import { Symbol } from "./constants.js";
import { AssemblyInstruction, FunctionInstruction, ReturnInstruction, ToAssembly } from "./types.js";
import { toLabel } from "./utils.js";

export const functionToAssembly = ({
  vmInstruction: { locals },
  context: { fileName, functionName },
}: ToAssembly<FunctionInstruction>): readonly AssemblyInstruction[] => {
  const assemblyInstructions: AssemblyInstruction[] = [`(${toLabel({ fileName, functionName })})`];

  for (let i = 0; i < locals; i++) {
    assemblyInstructions.push(`@${Symbol.SP}`, "A=M", "M=0", `@${Symbol.SP}`, "M=M+1");
  }

  return assemblyInstructions;
};

export const returnToAssembly = ({}: ToAssembly<ReturnInstruction>): readonly AssemblyInstruction[] => {
  return [
    // endframe = LCL
    `@${Symbol.LCL}`,
    "D=M",
    `@${Symbol.R13}`,
    "M=D",
    // *ARG = pop()
    `@${Symbol.SP}`,
    "A=M-1",
    "D=M",
    `@${Symbol.ARG}`,
    "A=M",
    "M=D",
    // SP = ARG + 1,
    `@${Symbol.ARG}`,
    "D=M+1",
    `@${Symbol.SP}`,
    "M=D",
    // THAT = *(endFrame - 1)
    // "",
    // THIS = *(endFrame - 2)
    // "",
    // ARG = *(endFrame - 3)
    // "",
    // LCL = *(endFrame - 4)
    // "",
    // returnAddress = *(endFrame - 5)
    // "@5",
    // "A=D-A",
    // goto returnAddress
    // "",
  ];
};
