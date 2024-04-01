import { ArithmeticLogicalCommand, INFINITE_LOOP, Symbol, Segment, StackCommand, TEMP_OFFSET } from "./constants.js";
import {
  ArithmeticLogicalInstruction,
  AssemblyInstruction,
  PopInstruction,
  PushInstruction,
  Result,
  VmInstruction,
} from "./types.js";
import {
  error,
  isArithemticLogicalCommand,
  isComment,
  isEmptyLine,
  isSegment,
  isStackCommand,
  isValidIndex,
  segmentToSymbol,
  toComment,
  toLabel,
  toVariableSymbol,
} from "./utils.js";

const toVmInstruction = (line: string): Result<{ vmInstruction: VmInstruction }> => {
  const instructionParts = line.split(/\s+/);

  if (!(instructionParts.length === 3 || instructionParts.length === 1)) {
    return { success: false, message: `${line} is not a valid VM instruction (too many parts)` };
  }

  if (instructionParts.length === 1) {
    const command = instructionParts[0];
    return command && isArithemticLogicalCommand(command)
      ? { success: true, vmInstruction: { command: command } }
      : { success: false, message: `${command} is not a valid Arithmetic-Logical command` };
  }

  const [command, segment, index] = instructionParts;

  if (
    !command ||
    !segment ||
    index === undefined ||
    !isStackCommand(command) ||
    !isSegment(segment) ||
    !isValidIndex(index)
  ) {
    return { success: false, message: `${line} is not a valid VM instruction (invalid command/segment/index)` };
  }

  const indexNum = Number(index);

  if (segment === Segment.Temp && (indexNum < 0 || indexNum > 7)) {
    return { success: false, message: `${Segment.Temp} index must be in range 0-7` };
  }

  if (command === StackCommand.Push) {
    return { success: true, vmInstruction: { command, segment, index: indexNum } };
  }

  if (segment === Segment.Constant) {
    return { success: false, message: `${Segment.Constant} is not a valid segment for ${StackCommand.Push} commands` };
  }

  return { success: true, vmInstruction: { command, segment, index: indexNum } };
};

const pushToAssembly = ({
  segment,
  index,
  fileName,
}: PushInstruction & { fileName: string }): readonly AssemblyInstruction[] => {
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

const popToAssembly = ({
  segment,
  index,
  fileName,
}: PopInstruction & { fileName: string }): readonly AssemblyInstruction[] => {
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

const arithmeticLogicalToAssembly = ({
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

const toAssembly = (args: VmInstruction & { fileName: string; lineNumber: number }): readonly AssemblyInstruction[] => {
  switch (args.command) {
    case StackCommand.Push:
      return pushToAssembly(args);
    case StackCommand.Pop:
      return popToAssembly(args);
    default:
      return arithmeticLogicalToAssembly(args);
  }
};

export const translate = ({
  vmProgram,
  fileName,
}: {
  vmProgram: readonly string[];
  fileName: string;
}): Result<{ assemblyInstructions: readonly AssemblyInstruction[] }> => {
  const assemblyInstructions: AssemblyInstruction[] = [];

  for (const [i, line] of vmProgram.entries()) {
    if (isEmptyLine(line) || isComment(line)) {
      continue;
    }

    const lineNumber = i + 1;
    const vmInstructionResult = toVmInstruction(line);

    if (!vmInstructionResult.success) {
      return { ...vmInstructionResult, message: error(vmInstructionResult.message, { lineNumber }) };
    }

    const { vmInstruction } = vmInstructionResult;

    assemblyInstructions.push(toComment(line));
    assemblyInstructions.push(...toAssembly({ ...vmInstruction, fileName, lineNumber }));
  }

  assemblyInstructions.push(toComment("end program with infinite loop"));
  assemblyInstructions.push(...INFINITE_LOOP);

  return { success: true, assemblyInstructions };
};
