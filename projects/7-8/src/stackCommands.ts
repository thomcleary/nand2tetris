import { Segment, Symbol, TEMP_OFFSET } from "./constants.js";
import { AssemblyInstruction, PopInstruction, PushInstruction, TranslationContext } from "./types.js";
import { segmentToSymbol, toVariableSymbol } from "./utils.js";

export const pushToAssembly = ({
  instruction: { segment, index },
  context: { fileName },
}: {
  instruction: PushInstruction;
  context: TranslationContext;
}): readonly AssemblyInstruction[] => {
  const push = ["@SP", "A=M", "M=D", "@SP", "M=M+1"] as const satisfies AssemblyInstruction[];

  switch (segment) {
    case Segment.Constant:
      return [`@${index}`, "D=A", ...push];
    case Segment.Argument:
    case Segment.Local:
    case Segment.This:
    case Segment.That:
    case Segment.Temp:
      return [
        `@${index}`,
        "D=A",
        `@${segment === Segment.Temp ? TEMP_OFFSET : segmentToSymbol(segment)}`,
        `A=D+${segment === Segment.Temp ? "A" : "M"}`,
        "D=M",
        ...push,
      ];
    case Segment.Pointer:
      return [`@${index === 0 ? Symbol.THIS : Symbol.THAT}`, "D=M", ...push];
    case Segment.Static:
      return [`@${toVariableSymbol({ fileName, index })}`, "D=M", ...push];
  }
};

export const popToAssembly = ({
  instruction: { segment, index },
  context: { fileName },
}: {
  instruction: PopInstruction;
  context: TranslationContext;
}): readonly AssemblyInstruction[] => {
  switch (segment) {
    case Segment.Argument:
    case Segment.Local:
    case Segment.This:
    case Segment.That:
    case Segment.Temp:
      return [
        `@${index}`,
        "D=A",
        `@${segment === Segment.Temp ? TEMP_OFFSET : segmentToSymbol(segment)}`,
        `D=D+${segment === Segment.Temp ? "A" : "M"}`,
        "@R13",
        "M=D",
        "@SP",
        "AM=M-1",
        "D=M",
        "@R13",
        "A=M",
        "M=D",
      ];
    case Segment.Pointer:
      return ["@SP", "AM=M-1", "D=M", `@${index === 0 ? Symbol.THIS : Symbol.THAT}`, "M=D"];
    case Segment.Static:
      return ["@SP", "AM=M-1", "D=M", `@${toVariableSymbol({ fileName, index })}`, "M=D"];
  }
};
