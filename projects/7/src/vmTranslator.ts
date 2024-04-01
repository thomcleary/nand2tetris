import { ArithmeticLogicalCommand, INFINITE_LOOP, Symbol, Segment, StackCommand, TEMP_OFFSET } from "./constants.js";
import { ArithmeticLogicalInstruction, PopInstruction, PushInstruction, Result, VmInstruction } from "./types.js";
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

// TODO: create helper functions for reused assembly instructions?
// or just make a cool type to check the commands are valid?

const pushToAssembly = ({ segment, index }: PushInstruction): readonly string[] => {
  switch (segment) {
    case Segment.Constant:
      return [`@${index}`, "D=A", "@SP", "A=M", "M=D", "@SP", "M=M+1"];
    case Segment.Argument:
    case Segment.Local:
    case Segment.This:
    case Segment.That:
    case Segment.Temp:
      return [
        // TODO: creating address from segment + index is the same in popToAssembly
        // maybe reuse?
        `@${index}`,
        "D=A",
        `@${segment === Segment.Temp ? TEMP_OFFSET : segmentToSymbol(segment)}`,
        `A=D+${segment === Segment.Temp ? "A" : "M"}`,
        "D=M",
        "@SP",
        "A=M",
        "M=D",
        "@SP",
        "M=M+1",
      ];
    // case Segment.Static:
    //   return [];
    // case Segment.Pointer:
    //   return [];
    default:
      console.error(`${segment} is not implemented for push operations yet`);
      return [];
  }
};

const popToAssembly = ({ segment, index }: PopInstruction): readonly string[] => {
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
    // case Segment.Static:
    //   return []
    // case Segment.Pointer:
    //   return []
    default:
      console.error(`${segment} is not implemented for pop operations yet`);
      return [];
  }
};

const arithmeticLogicalToAssembly = ({
  command,
  fileName,
  lineNumber,
}: ArithmeticLogicalInstruction & { fileName: string; lineNumber: number }): readonly string[] => {
  const identifier = `${fileName}.${lineNumber}`;

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
          {
            [ArithmeticLogicalCommand.Add]: "+",
            [ArithmeticLogicalCommand.Sub]: "-",
            [ArithmeticLogicalCommand.And]: "&",
            [ArithmeticLogicalCommand.Or]: "|",
          }[command]
        }D`,
        "@SP",
        "M=M+1",
      ];
    case ArithmeticLogicalCommand.Neg:
    case ArithmeticLogicalCommand.Not:
      return [
        "@SP",
        "AM=M-1",
        `M=${{ [ArithmeticLogicalCommand.Neg]: "-", [ArithmeticLogicalCommand.Not]: "!" }[command]}M`,
        "@SP",
        "M=M+1",
      ];
    case ArithmeticLogicalCommand.Eq:
    case ArithmeticLogicalCommand.Gt:
    case ArithmeticLogicalCommand.Lt:
      return [
        "@SP",
        "AM=M-1",
        "D=M",
        "@SP",
        "AM=M-1",
        "D=M-D",
        // TODO: function to create a label?
        `@${identifier}.EQ.TRUE`,
        `D;${
          {
            [ArithmeticLogicalCommand.Eq]: "JEQ",
            [ArithmeticLogicalCommand.Gt]: "JGT",
            [ArithmeticLogicalCommand.Lt]: "JLT",
          }[command]
        }`,
        "@SP",
        "A=M",
        "M=0",
        `@${identifier}.EQ.END`,
        "0;JMP",
        `(${identifier}.EQ.TRUE)`,
        "@SP",
        "A=M",
        "M=-1",
        `(${identifier}.EQ.END)`,
        "@SP",
        "M=M+1",
      ];
  }
};

const toAssembly = ({
  vmInstruction,
  fileName,
  lineNumber,
}: {
  vmInstruction: VmInstruction;
  fileName: string;
  lineNumber: number;
}): readonly string[] => {
  switch (vmInstruction.command) {
    case StackCommand.Push:
      return pushToAssembly(vmInstruction);
    case StackCommand.Pop:
      return popToAssembly(vmInstruction);
    default:
      return arithmeticLogicalToAssembly({ ...vmInstruction, fileName, lineNumber });
  }
};

export const translate = ({
  vmProgram,
  fileName,
}: {
  vmProgram: readonly string[];
  fileName: string;
}): Result<{ assemblyInstructions: readonly string[] }> => {
  const assemblyInstructions: string[] = [];

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
    assemblyInstructions.push(...toAssembly({ vmInstruction, fileName, lineNumber }));
  }

  assemblyInstructions.push(...INFINITE_LOOP);

  return { success: true, assemblyInstructions };
};
