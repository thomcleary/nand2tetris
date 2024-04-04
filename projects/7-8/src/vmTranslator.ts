import { arithmeticLogicalToAssembly } from "./arithmeticLogicalCommands.js";
import { ifGotoToAssembly, labelToAssembly } from "./branchCommands.js";
import { BranchCommand, INFINITE_LOOP, Segment, StackCommand } from "./constants.js";
import { popToAssembly, pushToAssembly } from "./stackCommands.js";
import { AssemblyInstruction, Result, VmInstruction } from "./types.js";
import {
  error,
  isArithemticLogicalCommand,
  isBranchCommand,
  isComment,
  isEmptyLine,
  isSegment,
  isStackCommand,
  isValidIndex,
  toComment,
} from "./utils.js";

const toVmInstruction = (line: string): Result<{ vmInstruction: VmInstruction }> => {
  const instructionParts = line.split(/\s+/);
  const commentStart = instructionParts.findIndex((i) => i.startsWith("//"));
  commentStart >= 0 && instructionParts.splice(commentStart);

  if (instructionParts.length < 1 || instructionParts.length > 3) {
    return {
      success: false,
      message: `VM instruction "${line}" may only have 1-3 parts but has ${instructionParts.length}`,
    };
  }

  if (instructionParts.length === 1) {
    const command = instructionParts[0];
    return command && isArithemticLogicalCommand(command)
      ? { success: true, vmInstruction: { command: command } }
      : { success: false, message: `"${command}" is not a valid Arithmetic-Logical command` };
  }

  if (instructionParts.length === 2) {
    const [command, label] = instructionParts;
    return command && label && isBranchCommand(command)
      ? { success: true, vmInstruction: { command, label } }
      : { success: false, message: `"${command}" is not a valid Branch command` };
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
    return { success: false, message: `"${line}" is not a valid VM instruction (invalid command/segment/index)` };
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

const toAssembly = (args: VmInstruction & { fileName: string; lineNumber: number }): readonly AssemblyInstruction[] => {
  switch (args.command) {
    case StackCommand.Push:
      return pushToAssembly(args);
    case StackCommand.Pop:
      return popToAssembly(args);
    case BranchCommand.Label:
      return labelToAssembly(args);
    // case BranchCommand.Goto:
    case BranchCommand.IfGoto:
      return ifGotoToAssembly(args);
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
