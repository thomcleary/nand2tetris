import { AssemblyInstruction, FunctionInstruction, ReturnInstruction, ToAssembly } from "./types.js";
import { toLabel } from "./utils.js";

export const functionToAssembly = ({
  context: { fileName, functionName },
}: ToAssembly<FunctionInstruction>): readonly AssemblyInstruction[] => {
  return [`(${toLabel({ fileName, functionName })})`];
};

// TODO: SimpleFunction.tst
// Need to implement reverting the state of the stack and segment pointers when return instruction is executed
// Run VME.tst script in the VME emulator first to make sure you know whats going on
export const returnToAssembly = ({}: ToAssembly<ReturnInstruction>): readonly AssemblyInstruction[] => {
  return [];
};
