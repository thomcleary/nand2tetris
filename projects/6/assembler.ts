import { readFileSync, writeFileSync } from "fs";

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
  "0": 0b1010_1000_0000,
  "1": 0b1111_1100_0000,
  "-1": 0b1110_1000_0000,
  D: 0b0011_0000_0000,
  A: 0b1100_0000_0000,
  M: 0b1100_0000_0000,
  "!D": 0b0011_0100_0000,
  "!A": 0b1100_0100_0000,
  "!M": 0b1100_0100_0000,
  "-D": 0b0011_1100_0000,
  "-A": 0b1100_1100_0000,
  "-M": 0b1100_1100_0000,
  "D+1": 0b0111_1100_0000,
  "A+1": 0b1101_1100_0000,
  "M+1": 0b1101_1100_0000,
  "D-1": 0b0011_1000_0000,
  "A-1": 0b1100_1000_0000,
  "M-1": 0b1100_1000_0000,
  "D+A": 0b0000_1000_0000,
  "D+M": 0b0000_1000_0000,
  "D-A": 0b0100_1100_0000,
  "D-M": 0b0100_1100_0000,
  "A-D": 0b0001_1100_0000,
  "M-D": 0b0001_1100_0000,
  "D&A": 0b0000_0000_0000,
  "D&M": 0b0000_0000_0000,
  "D|A": 0b0101_0100_0000,
  "D|M": 0b0101_0100_0000,
} as const;

const JUMP_CODES = {
  JGT: 0b001,
  JEQ: 0b010,
  JGE: 0b011,
  JLT: 0b100,
  JNE: 0b110,
  JLE: 0b110,
  JMP: 0b111,
} as const;

const isValidDestCode = (code: string): code is keyof typeof DEST_CODES => Object.keys(DEST_CODES).includes(code);
const isValidCompCode = (code: string): code is keyof typeof COMP_CODES => Object.keys(COMP_CODES).includes(code);
const isValidJumpCode = (code: string): code is keyof typeof JUMP_CODES => Object.keys(JUMP_CODES).includes(code);
const isMemoryCompCode = (code: keyof typeof COMP_CODES) => code.includes("M");

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
      // TODO: dont remove whitespace or comments and improve error messages to include line number
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

// TODO: break down into separate functions for A/C
const parse = ({
  assemblyProgram,
  symbolTable,
}: {
  assemblyProgram: readonly string[];
  symbolTable: Map<string, number>;
}): Result<{ hackInstructions: readonly string[] }> => {
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
      let cInstruction = C_INSTRUCTION_PREFIX;
      const destAndRest = instruction.split("=");

      if (destAndRest.length < 1 || destAndRest.length > 3) {
        return { success: false, message: `error: instruction ${instruction} is invalid` };
      }

      if (destAndRest.length === 2) {
        const dest = destAndRest.shift();

        if (!dest || !isValidDestCode(dest)) {
          return { success: false, message: `error: ${dest} is not a valid destination register` };
        }

        cInstruction |= DEST_CODES[dest];
      }

      const compAndJump = destAndRest.shift()?.split(";");
      const comp = compAndJump?.shift();

      if (!comp) {
        return { success: false, message: `error: instruction ${instruction} is missing comp symbol` };
      }

      if (!isValidCompCode(comp)) {
        return { success: false, message: `error: ${comp} is not a valid comp symbol` };
      }

      cInstruction |= COMP_CODES[comp];

      if (isMemoryCompCode(comp)) {
        cInstruction |= MEMORY_COMP_CODE;
      }

      const jump = compAndJump?.shift();

      if (jump) {
        if (!isValidJumpCode(jump)) {
          return { success: false, message: `error: ${jump} is not a valid jump symbol` };
        }

        cInstruction |= JUMP_CODES[jump];
      }

      hackInstructions.push(cInstruction.toString(2));
    }
  }

  return { success: true, hackInstructions };
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
  const parseResult = parse({ assemblyProgram, symbolTable });

  if (!parseResult.success) {
    console.log(parseResult.message);
    return;
  }

  const { hackInstructions } = parseResult;
  const hackFileName = filePath.replace(".asm", ".hack");

  try {
    writeFileSync(hackFileName, hackInstructions.join("\n"));
  } catch {
    console.log(`error: unable to write file ${hackFileName}`);
  }
};

main();
