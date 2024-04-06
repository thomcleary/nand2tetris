import {
  AssemblyInstruction,
  FunctionInstruction,
  ReturnInstruction,
  ToAssembly,
  TranslationContext,
} from "./types.js";

export const functionToAssembly = ({}: ToAssembly<FunctionInstruction>): readonly AssemblyInstruction[] => {
  return [];
};

export const returnToAssembly = ({}: ToAssembly<ReturnInstruction>): readonly AssemblyInstruction[] => {
  return [];
};
