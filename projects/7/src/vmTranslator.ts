import { ArithmeticLogicalCommand, INFINITE_LOOP, Segment, StackCommand } from "./constants.js";
import { ArithmeticLogicalInstruction, PopInstruction, PushInstruction, Result, VmInstruction } from "./types.js";
import {
  error,
  isArithemticLogicalCommand,
  isComment,
  isEmptyLine,
  isSegment,
  isStackCommand,
  isValidIndex,
  toComment,
} from "./utils.js";

const toVmInstruction = (line: string): Result<{ vmInstruction: VmInstruction }> => {
  const instructionParts = line.split(/\s+/);

  if (!(instructionParts.length === 3 || instructionParts.length === 1)) {
    return { success: false, message: `${line} is not a valid VM instruction` };
  }

  if (instructionParts.length === 1) {
    const command = instructionParts[0];
    return command && isArithemticLogicalCommand(command)
      ? { success: true, vmInstruction: { command: command } }
      : { success: false, message: `${command} is not a valid Arithmetic-Logical command` };
  }

  const [command, segment, index] = instructionParts;

  if (!command || !segment || !index || !isStackCommand(command) || !isSegment(segment) || !isValidIndex(index)) {
    return { success: false, message: `${line} is not a valid VM instruction` };
  }

  const indexNum = Number(index);

  if (command === StackCommand.Push) {
    return { success: true, vmInstruction: { command, segment, index: indexNum } };
  }

  if (segment === Segment.Constant) {
    return { success: false, message: `${Segment.Constant} is not a valid segment for ${StackCommand.Push} commands` };
  }

  return { success: true, vmInstruction: { command, segment, index: indexNum } };
};

const pushToAssembly = ({ segment, index }: PushInstruction): readonly string[] => {
  if (segment !== Segment.Constant) {
    throw new Error(`${segment} is not implemented for push operations yet`);
  }

  return [`@${index}`, "D=A", "@SP", "A=M", "M=D", "@SP", "M=M+1"];
};

const popToAssembly = ({ segment, index }: PopInstruction): readonly string[] => {
  return [];
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
      return [
        "@SP",
        "AM=M-1",
        "D=M",
        "@SP",
        "AM=M-1",
        "D=M-D",
        `@EQ.TRUE.${identifier}`,
        "D;JEQ",
        "@SP",
        "A=M",
        "M=0",
        `@EQ.END.${identifier}`,
        "0;JMP",
        `(EQ.TRUE.${identifier})`,
        "@SP",
        "A=M",
        "M=-1",
        `(EQ.END.${identifier})`,
        "@SP",
        "M=M+1",
      ];
    // case ArithmeticLogicalCommand.Gt:
    //   return [];
    // case ArithmeticLogicalCommand.Lt:
    //   return [];
    default:
      console.error(`${command} not implemented`);
      return [];
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
