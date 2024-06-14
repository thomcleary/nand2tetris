import { ArithmeticLogicalCommand, Symbol } from "../constants.js";
import type { ArithmeticLogicalInstruction, AssemblyInstruction, ToAssembly } from "../types.js";
import { toLabel } from "../utils.js";

export const arithmeticLogicalToAssembly = ({
  vmInstruction: { command },
  context: { fileName, currentFunction, lineNumber },
}: ToAssembly<ArithmeticLogicalInstruction>): readonly AssemblyInstruction[] => {
  switch (command) {
    case ArithmeticLogicalCommand.Add:
    case ArithmeticLogicalCommand.Sub:
    case ArithmeticLogicalCommand.Or:
    case ArithmeticLogicalCommand.And:
      return [
        `@${Symbol.SP}`,
        "AM=M-1",
        "D=M",
        `@${Symbol.SP}`,
        "AM=M-1",
        `M=M${
          (
            {
              [ArithmeticLogicalCommand.Add]: "+",
              [ArithmeticLogicalCommand.Sub]: "-",
              [ArithmeticLogicalCommand.And]: "&",
              [ArithmeticLogicalCommand.Or]: "|",
            } as const
          )[command]
        }D`,
        `@${Symbol.SP}`,
        "M=M+1",
      ];
    case ArithmeticLogicalCommand.Neg:
    case ArithmeticLogicalCommand.Not:
      return [
        `@${Symbol.SP}`,
        "AM=M-1",
        `M=${({ [ArithmeticLogicalCommand.Neg]: "-", [ArithmeticLogicalCommand.Not]: "!" } as const)[command]}M`,
        `@${Symbol.SP}`,
        "M=M+1",
      ];
    case ArithmeticLogicalCommand.Eq:
    case ArithmeticLogicalCommand.Gt:
    case ArithmeticLogicalCommand.Lt:
      const trueLabel = toLabel({ fileName, functionName: currentFunction, label: `${command}TRUE`, lineNumber });
      const endLabel = toLabel({ fileName, functionName: currentFunction, label: `${command}END`, lineNumber });
      return [
        `@${Symbol.SP}`,
        "AM=M-1",
        "D=M",
        `@${Symbol.SP}`,
        "AM=M-1",
        "D=M-D",
        `@${trueLabel}`,
        `D;${
          (
            {
              [ArithmeticLogicalCommand.Eq]: "JEQ",
              [ArithmeticLogicalCommand.Gt]: "JGT",
              [ArithmeticLogicalCommand.Lt]: "JLT",
            } as const
          )[command]
        }`,
        `@${Symbol.SP}`,
        "A=M",
        "M=0",
        `@${endLabel}`,
        "0;JMP",
        `(${trueLabel})`,
        `@${Symbol.SP}`,
        "A=M",
        "M=-1",
        `(${endLabel})`,
        `@${Symbol.SP}`,
        "M=M+1",
      ];
  }
};
