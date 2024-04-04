import { ArithmeticLogicalCommand } from "./constants.js";
import { ArithmeticLogicalInstruction, AssemblyInstruction } from "./types.js";
import { toLabel } from "./utils.js";

export const arithmeticLogicalToAssembly = ({
  command,
  fileName,
  lineNumber,
}: ArithmeticLogicalInstruction & { fileName: string; lineNumber: number }): readonly AssemblyInstruction[] => {
  const labelPrefix = `${fileName}.${lineNumber}`;

  switch (command) {
    case ArithmeticLogicalCommand.Add:
    case ArithmeticLogicalCommand.Sub:
    case ArithmeticLogicalCommand.Or:
    case ArithmeticLogicalCommand.And:
      return [
        "@SP",
        "AM=M-1",
        "D=M",
        "@SP",
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
        "@SP",
        "M=M+1",
      ];
    case ArithmeticLogicalCommand.Neg:
    case ArithmeticLogicalCommand.Not:
      return [
        "@SP",
        "AM=M-1",
        `M=${({ [ArithmeticLogicalCommand.Neg]: "-", [ArithmeticLogicalCommand.Not]: "!" } as const)[command]}M`,
        "@SP",
        "M=M+1",
      ];
    case ArithmeticLogicalCommand.Eq:
    case ArithmeticLogicalCommand.Gt:
    case ArithmeticLogicalCommand.Lt:
      const trueLabel = toLabel(labelPrefix, command, "TRUE");
      const endLabel = toLabel(labelPrefix, command, "END");
      return [
        "@SP",
        "AM=M-1",
        "D=M",
        "@SP",
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
        "@SP",
        "A=M",
        "M=0",
        `@${endLabel}`,
        "0;JMP",
        `(${trueLabel})`,
        "@SP",
        "A=M",
        "M=-1",
        `(${endLabel})`,
        "@SP",
        "M=M+1",
      ];
  }
};
