import { readFileSync } from "fs";

type Result<T extends Record<PropertyKey, unknown>> = ({ success: true } & T) | { success: false; message: string };

const PREDEFINED_SYMBOLS = {
  RO: 0,
  R1: 1,
  R2: 2,
  R3: 3,
  R4: 4,
  R5: 5,
  R6: 6,
  R7: 7,
  R8: 8,
  R9: 9,
  R10: 10,
  R11: 11,
  R12: 12,
  R13: 13,
  R14: 14,
  R15: 15,
  SP: 0,
  LCL: 1,
  ARG: 2,
  THIS: 3,
  THAT: 4,
  SCREEN: 16384,
  KBD: 24576,
} as const;

const C_INSTRUCTION_PREFIX = 0b1110_0000_0000_0000;
const MEMORY_COMP_CODE = 0b0001_0000_0000_0000;

const DEST_CODES = {
  A: 0b10_0000,
  D: 0b01_0000,
  M: 0b00_1000,
} as const;

const COMP_CODES = {
  0: 0b101010,
  1: 0b111111,
  "-1": 0b111010,
  D: 0b001100,
  A: 0b110000,
  M: 0b110000,
  "!D": 0b001101,
  "!A": 0b110001,
  "!M": 0b110001,
  "-D": 0b001111,
  "-A": 0b110011,
  "-M": 0b110011,
  "D+1": 0b011111,
  "A+1": 0b110111,
  "M+1": 0b110111,
  "D-1": 0b001110,
  "A-1": 0b110010,
  "M-1": 0b110010,
  "D+A": 0b000010,
  "D+M": 0b000010,
  "D-A": 0b010011,
  "D-M": 0b010011,
  "A-D": 0b000111,
  "M-D": 0b000111,
  "D&A": 0b000000,
  "D&M": 0b000000,
  "D|A": 0b010101,
  "D|M": 0b010101,
} as const;

const JUMP_CODES = {
  JGT: 0b001,
  JEQ: 0b010,
  JGE: 0b011,
  JLT: 0b100,
  JNE: 0b110,
  JMP: 0b111,
} as const;

const getAssemblyFilePath = (): Result<{ filePath: string }> => {
  const filePath = process.argv[2];

  if (!filePath) {
    return {
      success: false,
      message: "error: missing program file path" + "\n" + "usage: pnpm assembler ./path/to/program.asm",
    };
  }

  if (!filePath.endsWith(".asm")) {
    return { success: false, message: `error: file type of ${filePath} is not .asm` };
  }

  return { success: true, filePath };
};

const getAssemblyProgram = (filePath: string): Result<{ assemblyProgram: readonly string[] }> => {
  try {
    return {
      success: true,
      assemblyProgram: readFileSync(filePath)
        .toString()
        .trim()
        .split("\n")
        .map((line) => line.trim().replaceAll(" ", ""))
        .filter((line) => !!line && !line.startsWith("//")),
    };
  } catch {
    return { success: false, message: `error: unable to read file ${filePath}` };
  }
};

const getSymbolTable = (assemblyProgram: readonly string[]): Result<{ symbolTable: Map<string, number> }> => {
  const symbolTable = new Map<string, number>(Object.entries(PREDEFINED_SYMBOLS));

  let instructionCount = -1;

  for (const line of assemblyProgram) {
    if (line.startsWith("(")) {
      const label = line.replace("(", "").replace(")", "");

      if (Object.keys(PREDEFINED_SYMBOLS).includes(label)) {
        return { success: false, message: `error: predefined symbol ${label} cannot be used as a label` };
      }
      if (symbolTable.has(label)) {
        return { success: false, message: `error: label ${label} is defined more than once` };
      }

      symbolTable.set(label, instructionCount + 1);
    } else {
      instructionCount++;
    }
  }

  return { success: true, symbolTable };
};

const aToHack = (a: number): string => a.toString(2).padStart(16, "0");

const parse = ({
  assemblyProgram,
  symbolTable,
}: {
  assemblyProgram: readonly string[];
  symbolTable: Map<string, number>;
}): { hackInstructions: readonly string[] } => {
  const assemblyInstructions = assemblyProgram.filter((i) => !i.startsWith("("));
  const hackInstructions: string[] = [];
  let nextVariableAddress = 16;

  for (const instruction of assemblyInstructions) {
    if (instruction.startsWith("@")) {
      const address = instruction.slice(1);

      if (/^\d+$/.test(address)) {
        hackInstructions.push(aToHack(Number(address)));
      } else {
        const symbolAddress = symbolTable.get(address);

        if (symbolAddress !== undefined) {
          hackInstructions.push(aToHack(symbolAddress));
        } else {
          symbolTable.set(address, nextVariableAddress);
          hackInstructions.push(aToHack(nextVariableAddress));
          nextVariableAddress++;
        }
      }
    } else {
      // TODO: C instructions
      const instruction = C_INSTRUCTION_PREFIX;
    }
  }

  console.log(hackInstructions);
  return { hackInstructions };
};

const main = () => {
  const assemblyFilePathResult = getAssemblyFilePath();

  if (!assemblyFilePathResult.success) {
    console.log(assemblyFilePathResult.message);
    return;
  }

  const { filePath } = assemblyFilePathResult;
  const assemblyProgramResult = getAssemblyProgram(filePath);

  if (!assemblyProgramResult.success) {
    console.log(assemblyProgramResult.message);
    return;
  }

  const { assemblyProgram } = assemblyProgramResult;
  const symbolTableResult = getSymbolTable(assemblyProgram);

  if (!symbolTableResult.success) {
    console.log(symbolTableResult.message);
    return;
  }

  const { symbolTable } = symbolTableResult;
  const { hackInstructions } = parse({ assemblyProgram, symbolTable });

  // TODO: write binary hack instructions to a new file ./path/to/program.hack
};

main();
