import { Segment, StackCommand, Symbol, TEMP_OFFSET } from "./constants.js";
import { AssemblyInstruction, StackInstruction, ToAssembly } from "./types.js";
import { segmentToSymbol, toVariableSymbol } from "./utils.js";

export const pushToAssembly = ({
  vmInstruction: { segment, index },
  context: { fileName },
}: ToAssembly<StackInstruction<StackCommand.Push>>): readonly AssemblyInstruction[] => {
  const push = [`@${Symbol.SP}`, "A=M", "M=D", `@${Symbol.SP}`, "M=M+1"] as const satisfies AssemblyInstruction[];

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
  vmInstruction: { segment, index },
  context: { fileName },
}: ToAssembly<StackInstruction<StackCommand.Pop>>): readonly AssemblyInstruction[] => {
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
        `@${Symbol.R13}`,
        "M=D",
        `@${Symbol.SP}`,
        "AM=M-1",
        "D=M",
        `@${Symbol.R13}`,
        "A=M",
        "M=D",
      ];
    case Segment.Pointer:
      return [`@${Symbol.SP}`, "AM=M-1", "D=M", `@${index === 0 ? Symbol.THIS : Symbol.THAT}`, "M=D"];
    case Segment.Static:
      return [`@${Symbol.SP}`, "AM=M-1", "D=M", `@${toVariableSymbol({ fileName, index })}`, "M=D"];
  }
};
