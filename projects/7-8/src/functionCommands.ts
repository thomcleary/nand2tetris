import { AssemblyInstruction, FunctionInstruction, ReturnInstruction, ToAssembly } from "./types.js";
import { toLabel } from "./utils.js";

export const functionToAssembly = ({
  vmInstruction: { locals },
  context: { fileName, functionName },
}: ToAssembly<FunctionInstruction>): readonly AssemblyInstruction[] => {
  const assemblyInstructions: AssemblyInstruction[] = [`(${toLabel({ fileName, functionName })})`];

  for (let i = 0; i < locals; i++) {
    assemblyInstructions.push("@SP", "A=M", "M=0", "@SP", "M=M+1");
  }

  return assemblyInstructions;
};

// TODO: SimpleFunction.tst
// Need to implement reverting the state of the stack and segment pointers when return instruction is executed
// Run VME.tst script in the VME emulator first to make sure you know whats going on
export const returnToAssembly = ({}: ToAssembly<ReturnInstruction>): readonly AssemblyInstruction[] => {
  return [];
};
