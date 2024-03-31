import { readFileSync, writeFileSync } from "fs";
import { ArithmeticLogicalCommand, INFINITE_LOOP, Pointer, Segment, StackCommand } from "./constants.js";
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

const getVmFilePath = (): Result<{ filePath: string }> => {
  const filePath = process.argv[2];

  if (!filePath) {
    return {
      success: false,
      message: error("missing program file path" + "\n" + "usage: pnpm vmTranslator ./path/to/Program.vm"),
    };
  }

  if (!filePath.endsWith(".vm")) {
    return { success: false, message: error(`file type of ${filePath} is not .vm`) };
  }

  return { success: true, filePath };
};

const getVmProgram = (filePath: string): Result<{ vmProgram: readonly string[] }> => {
  try {
    return {
      success: true,
      vmProgram: readFileSync(filePath)
        .toString()
        .trim()
        .split("\n")
        .map((line) => line.trim()),
    };
  } catch {
    return { success: false, message: error(`unable to read file ${filePath}`) };
  }
};

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

export const aInstruction = (address: Pointer | number) => `@${address}` as const;
const decrementPointer = (pointer: Pointer) => [aInstruction(pointer), "AM=M-1"] as const;
const incrementPointer = (pointer: Pointer) => [aInstruction(pointer), "M=M+1"] as const;

const pushToAssembly = ({ command, segment, index }: PushInstruction): readonly string[] => {
  if (segment !== Segment.Constant) {
    throw new Error(`${segment} is not implemented for push operations yet`);
  }

  return [aInstruction(index), "D=A", aInstruction(Pointer.SP), "A=M", "M=D", ...incrementPointer(Pointer.SP)];
};

const popToAssembly = ({ command, segment, index }: PopInstruction): readonly string[] => {
  return [];
};

const arithmeticLogicalToAssembly = ({ command }: ArithmeticLogicalInstruction): readonly string[] => {
  switch (command) {
    case ArithmeticLogicalCommand.Add:
    case ArithmeticLogicalCommand.Sub:
    case ArithmeticLogicalCommand.Or:
    case ArithmeticLogicalCommand.And:
      return [
        ...decrementPointer(Pointer.SP),
        "D=M",
        ...decrementPointer(Pointer.SP),
        `M=M${
          {
            [ArithmeticLogicalCommand.Add]: "+",
            [ArithmeticLogicalCommand.Sub]: "-",
            [ArithmeticLogicalCommand.And]: "&",
            [ArithmeticLogicalCommand.Or]: "|",
          }[command]
        }D`,
        ...incrementPointer(Pointer.SP),
      ];
    case ArithmeticLogicalCommand.Neg:
    case ArithmeticLogicalCommand.Not:
      return [
        ...decrementPointer(Pointer.SP),
        `M=${{ [ArithmeticLogicalCommand.Neg]: "-", [ArithmeticLogicalCommand.Not]: "!" }[command]}M`,
        ...incrementPointer(Pointer.SP),
      ];
    // case ArithmeticLogicalCommand.Eq:
    //   TODO: will need to dynamically generate labels for jumping to assign M to true(-1) and false(0)
    //         as using this command multiple times in a program would otherwise cause multiple of the same
    //         label to be created
    //   return [];
    // case ArithmeticLogicalCommand.Gt:
    //   return [];
    // case ArithmeticLogicalCommand.Lt:
    //   return [];
    default:
      throw new Error(`${command} not implemented`);
  }
};

const toAssembly = (vmInstruction: VmInstruction): readonly string[] => {
  switch (vmInstruction.command) {
    case StackCommand.Push:
      return pushToAssembly(vmInstruction);
    case StackCommand.Pop:
      return popToAssembly(vmInstruction);
    default:
      return arithmeticLogicalToAssembly(vmInstruction);
  }
};

const translate = (vmProgram: readonly string[]): Result<{ assemblyInstructions: readonly string[] }> => {
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
    assemblyInstructions.push(...toAssembly(vmInstruction));
  }

  assemblyInstructions.push(...INFINITE_LOOP);

  return { success: true, assemblyInstructions };
};

const main = () => {
  const vmFilePathResult = getVmFilePath();

  if (!vmFilePathResult.success) {
    console.log(vmFilePathResult.message);
    return;
  }

  const { filePath } = vmFilePathResult;
  const vmProgramResult = getVmProgram(filePath);

  if (!vmProgramResult.success) {
    console.log(vmProgramResult.message);
    return;
  }

  const translateResult = translate(vmProgramResult.vmProgram);

  if (!translateResult.success) {
    console.log(translateResult.message);
    return;
  }

  const { assemblyInstructions } = translateResult;
  const assemblyFileName = filePath.replace(".vm", ".asm");

  try {
    writeFileSync(assemblyFileName, assemblyInstructions.join("\n"));
  } catch {
    console.log(error(`unable to write assembly instructions to file ${assemblyFileName}`));
  }
};

main();
