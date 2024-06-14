import { BranchCommand, FunctionCommand, Segment, StackCommand } from "./constants.js";
import { arithmeticLogicalToAssembly } from "./toAssembly/arithmeticLogicalCommands.js";
import { gotoToAssembly, ifGotoToAssembly, labelToAssembly } from "./toAssembly/branchCommands.js";
import { callToAssembly, functionToAssembly, returnToAssembly } from "./toAssembly/functionCommands.js";
import { popToAssembly, pushToAssembly } from "./toAssembly/stackCommands.js";
import type { AssemblyInstruction, Result, ToAssembly, TranslationContext, VmInstruction } from "./types.js";
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

  if (!command) {
    return { success: false, message: `command "${command}" in line "${line}" is not a valid command` };
  }

  if (command === FunctionCommand.Function) {
    const [_, func, locals] = instructionParts;
    const localsNum = Number(locals);

    if (!func || isNaN(localsNum)) {
      return { success: false, message: `"${line} is not a valid Function command"` };
    }

    return { success: true, vmInstruction: { command, func, locals: localsNum } };
  }

  if (command === FunctionCommand.Call) {
    const [_, func, args] = instructionParts;
    const argsNum = Number(args);

    if (!func || isNaN(argsNum)) {
      return { success: false, message: `"${line} is not a valid Call command"` };
    }

    return { success: true, vmInstruction: { command, func, args: argsNum } };
  }

  const [_, segment, index] = instructionParts;

  if (!segment || index === undefined || !isStackCommand(command) || !isSegment(segment) || !isValidIndex(index)) {
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
      return gotoToAssembly({ vmInstruction, context });
    case BranchCommand.IfGoto:
      return ifGotoToAssembly({ vmInstruction, context });
    case FunctionCommand.Function:
      return functionToAssembly({ vmInstruction, context });
    case FunctionCommand.Return:
      return returnToAssembly();
    case FunctionCommand.Call:
      return callToAssembly({ vmInstruction, context });
    default:
      return arithmeticLogicalToAssembly({ vmInstruction, context });
  }
};

export const translate = ({
  vmInstructions,
  fileName,
}: {
  vmInstructions: readonly string[];
  fileName: string;
}): Result<{ assemblyInstructions: readonly AssemblyInstruction[] }> => {
  const assemblyInstructions: AssemblyInstruction[] = [];
  let currentFunction: TranslationContext["currentFunction"] = undefined;

  for (const [i, line] of vmInstructions.entries()) {
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
      currentFunction = vmInstruction.func;
    }

    const context = { fileName, currentFunction, lineNumber } as const satisfies TranslationContext;

    assemblyInstructions.push(toComment(line));
    assemblyInstructions.push(...toAssembly({ vmInstruction, context }));
  }

  return { success: true, assemblyInstructions };
};
