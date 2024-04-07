import { Symbol } from "./constants.js";
import { AssemblyInstruction, CallInstruction, FunctionInstruction, ToAssembly } from "./types.js";
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

export const returnToAssembly = (): readonly AssemblyInstruction[] => [
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
  // Symbol = *(endFrame - symbolStackFrameOffset)
  ...([Symbol.THAT, Symbol.THIS, Symbol.ARG, Symbol.LCL] as const).flatMap(
    (s) =>
      [
        `@${{ [Symbol.THAT]: 1, [Symbol.THIS]: 2, [Symbol.ARG]: 3, [Symbol.LCL]: 4 }[s]}`,
        "D=A",
        `@${Symbol.R13}`,
        "A=M-D",
        "D=M",
        `@${s}`,
        "M=D",
      ] as const satisfies AssemblyInstruction[]
  ),
  // returnAddress = *(endFrame - 5)
  "@5",
  "D=A",
  `@${Symbol.R13}`,
  "A=M-D",
  "A=M",
  // goto returnAddress
  "0;JMP",
];

// TODO: NestedCall test
export const callToAssembly = ({
  vmInstruction: { func, args },
  context,
}: ToAssembly<CallInstruction>): readonly AssemblyInstruction[] => {
  return [];
};
