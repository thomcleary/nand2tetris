import { arithmeticLogicalToAssembly } from "./arithmeticLogicalCommands.js";
import { gotoToAssembly, labelToAssembly } from "./branchCommands.js";
import { BranchCommand, FunctionCommand, INFINITE_LOOP, Segment, StackCommand } from "./constants.js";
import { popToAssembly, pushToAssembly } from "./stackCommands.js";
import { AssemblyInstruction, Result, ToAssembly, TranslationContext, VmInstruction } from "./types.js";
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

    if (!command) {
      return { success: false, message: `"${command}" is not a valid Arithmetic-Logical command` };
    }

    if (isArithemticLogicalCommand(command) || command === FunctionCommand.Return) {
      return { success: true, vmInstruction: { command: command } };
    }

    return { success: false, message: `"${command}" is not a valid VM command` };
  }

  if (instructionParts.length === 2) {
    const [command, label] = instructionParts;
    return command && label && isBranchCommand(command)
      ? { success: true, vmInstruction: { command, label } }
      : { success: false, message: `"${command}" is not a valid Branch command` };
  }

  const [command] = instructionParts;

  if (command && command === FunctionCommand.Function) {
    const [_, name, locals] = instructionParts;
    const localsNum = Number(locals);

    if (!name || isNaN(localsNum)) {
      return { success: false, message: `"${line} is not a valid Function command"` };
    }

    return { success: true, vmInstruction: { command, name, locals: localsNum } };
  }

  const [_, segment, index] = instructionParts;

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

const toAssembly = ({ vmInstruction, context }: ToAssembly<VmInstruction>): readonly AssemblyInstruction[] => {
  switch (vmInstruction.command) {
    case StackCommand.Push:
      return pushToAssembly({ vmInstruction, context });
    case StackCommand.Pop:
      return popToAssembly({ vmInstruction, context });
    case BranchCommand.Label:
      return labelToAssembly({ vmInstruction, context });
    case BranchCommand.Goto:
    case BranchCommand.IfGoto:
      return gotoToAssembly({ vmInstruction, context });
    case FunctionCommand.Function:
      // TODO
      return [];
    case FunctionCommand.Return:
      // TODO
      return [];
    default:
      return arithmeticLogicalToAssembly({ vmInstruction, context });
  }
};

export const translate = ({
  vmProgram,
  fileName,
}: {
  vmProgram: readonly string[];
  fileName: string;
}): Result<{ assemblyInstructions: readonly AssemblyInstruction[] }> => {
  const assemblyInstructions: AssemblyInstruction[] = [
    // TODO: bootstrap instructions
  ];
  let currentFunctionName: TranslationContext["functionName"] = undefined;

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

    if (vmInstruction.command === FunctionCommand.Function) {
      currentFunctionName = vmInstruction.name;
    }

    console.log({ currentFunctionName });

    const context = { fileName, functionName: currentFunctionName, lineNumber } as const satisfies TranslationContext;

    assemblyInstructions.push(toComment(line));
    assemblyInstructions.push(...toAssembly({ vmInstruction, context }));
  }

  assemblyInstructions.push(toComment("end program with infinite loop"));
  assemblyInstructions.push(...INFINITE_LOOP);

  return { success: true, assemblyInstructions };
};
