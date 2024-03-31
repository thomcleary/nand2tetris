import { readFileSync, writeFileSync } from "fs";

type Result<T extends Record<PropertyKey, unknown>> = ({ success: true } & T) | { success: false; message: string };

type Segment = "argument" | "local" | "static" | "constant" | "this" | "that" | "pointer" | "temp";

type ArithmeticCommand = "add" | "sub" | "neg";
type ComparisonCommand = "eq" | "gt" | "lt";
type LogicalCommand = "and" | "or" | "not";

type VmInstruction =
  | {
      command: "push";
      segment: Segment;
      index: number;
    }
  | {
      command: "pop";
      segment: Exclude<Segment, "constant">;
      index: number;
    }
  | {
      command: ArithmeticCommand | ComparisonCommand | LogicalCommand;
    };

const isEmptyLine = (line: string) => /^\s*$/.test(line);
const isComment = (line: string) => line.startsWith("//");

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
  return { success: true, vmInstruction: { command: "add" } };
};

const toAssembly = (vmInstruction: VmInstruction): string[] => {
  return [];
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
    console.log({ vmInstruction });
    assemblyInstructions.push(...toAssembly(vmInstruction));
  }

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
