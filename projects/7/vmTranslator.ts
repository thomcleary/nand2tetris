import { readFileSync, writeFileSync } from "fs";
import { ArithmeticLogicalCommand, INFINITE_LOOP, Pointer, Segment, StackCommand } from "./constants.js";

type Result<T extends Record<PropertyKey, unknown>> = ({ success: true } & T) | { success: false; message: string };

type PushInstruction = {
  command: StackCommand.Push;
  segment: Segment;
  index: number;
};

type PopInstruction = {
  command: StackCommand.Pop;
  segment: Exclude<Segment, Segment.Constant>;
  index: number;
};

type ArithmeticLogicalInstruction = {
  command: ArithmeticLogicalCommand;
};

type VmInstruction = PushInstruction | PopInstruction | ArithmeticLogicalInstruction;

const isEmptyLine = (line: string) => /^\s*$/.test(line);
const isComment = (line: string) => line.startsWith("//");

const isArithemticLogicalCommand = (command: string): command is ArithmeticLogicalCommand => {
  const validCommands: string[] = Object.values(ArithmeticLogicalCommand);
  return validCommands.includes(command);
};

const isStackCommand = (command: string): command is StackCommand => {
  const validCommands: string[] = Object.values(StackCommand);
  return validCommands.includes(command);
};

const isSegment = (segment: string): segment is Segment => {
  const validSegments: string[] = Object.values(Segment);
  return validSegments.includes(segment);
};

const isValidIndex = (index: string): boolean => {
  const indexNum = Number(index);
  return !isNaN(indexNum) && indexNum > 0;
};

const error = (message: string, { lineNumber }: { lineNumber?: number } = {}) =>
  `error ${lineNumber !== undefined ? `(L${lineNumber}):` : ":"} ${message}`;

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

const toComment = (line: string) => `// ${line}` as const;
const aInstruction = (address: Pointer | number) => `@${address}` as const;

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
      return [
        ...decrementPointer(Pointer.SP),
        "D=M",
        ...decrementPointer(Pointer.SP),
        "M=M+D",
        ...incrementPointer(Pointer.SP),
      ];
    case ArithmeticLogicalCommand.Sub:
      return [
        ...decrementPointer(Pointer.SP),
        "D=M",
        ...decrementPointer(Pointer.SP),
        "M=M-D",
        ...incrementPointer(Pointer.SP),
      ];
    case ArithmeticLogicalCommand.Neg:
      return [...decrementPointer(Pointer.SP), "M=-M", ...incrementPointer(Pointer.SP)];
    // case ArithmeticLogicalCommand.Eq:
    //   return [];
    // case ArithmeticLogicalCommand.Gt:
    //   return [];
    // case ArithmeticLogicalCommand.Lt:
    //   return [];
    // case ArithmeticLogicalCommand.And:
    //   return [];
    // case ArithmeticLogicalCommand.Or:
    //   return [];
    // case ArithmeticLogicalCommand.Not:
    //   return [];
    default:
      throw new Error(`${command} not implemented`);
  }
};

const toAssembly = (vmInstruction: VmInstruction): readonly string[] => {
  console.log(vmInstruction);

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

  assemblyInstructions.forEach((i) => console.log(i));

  try {
    writeFileSync(assemblyFileName, assemblyInstructions.join("\n"));
  } catch {
    console.log(error(`unable to write assembly instructions to file ${assemblyFileName}`));
  }
};

main();
