import { readFileSync, writeFileSync } from "fs";
import {
  COMP_CODES,
  C_INSTRUCTION_PREFIX,
  DEST_CODES,
  JUMP_CODES,
  MEMORY_COMP_CODE,
  PREDEFINED_SYMBOLS,
  VARIABLE_ADDRESS_START,
} from "./constants.js";

type Result<T extends Record<PropertyKey, unknown>> = ({ success: true } & T) | { success: false; message: string };

const isValidDestCode = (code: string): code is keyof typeof DEST_CODES => Object.keys(DEST_CODES).includes(code);
const isValidCompCode = (code: string): code is keyof typeof COMP_CODES => Object.keys(COMP_CODES).includes(code);
const isValidJumpCode = (code: string): code is keyof typeof JUMP_CODES => Object.keys(JUMP_CODES).includes(code);
const isMemoryCompCode = (code: keyof typeof COMP_CODES) => code.includes("M");

const isEmptyLine = (line: string) => /^\s*$/.test(line);
const isComment = (line: string) => line.startsWith("//");
const isLabel = (line: string) => line.startsWith("(");
const isInstruction = (line: string) => !(isEmptyLine(line) || isComment(line) || isLabel(line));

const error = ({ message, lineNumber }: { message: string; lineNumber?: number }) =>
  `error ${lineNumber !== undefined ? `(L${lineNumber}):` : ":"} ${message}`;

const getAssemblyFilePath = (): Result<{ filePath: string }> => {
  const filePath = process.argv[2];

  if (!filePath) {
    return {
      success: false,
      message: error({ message: "missing program file path" + "\n" + "usage: pnpm assembler ./path/to/program.asm" }),
    };
  }

  if (!filePath.endsWith(".asm")) {
    return { success: false, message: error({ message: `file type of ${filePath} is not .asm` }) };
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
        .map((line) => line.trim().replaceAll(" ", "")),
    };
  } catch {
    return { success: false, message: error({ message: `unable to read file ${filePath}` }) };
  }
};

const getSymbolTable = (assemblyProgram: readonly string[]): Result<{ symbolTable: Map<string, number> }> => {
  const symbolTable = new Map<string, number>(Object.entries(PREDEFINED_SYMBOLS));

  let instructionCount = -1;

  for (const line of assemblyProgram) {
    if (line.startsWith("(")) {
      const label = line.replace("(", "").replace(")", "");

      if (Object.keys(PREDEFINED_SYMBOLS).includes(label)) {
        return { success: false, message: error({ message: `predefined symbol ${label} cannot be used as a label` }) };
      }
      if (symbolTable.has(label)) {
        return { success: false, message: error({ message: `label ${label} is defined more than once` }) };
      }

      symbolTable.set(label, instructionCount + 1);
    } else {
      isInstruction(line) && instructionCount++;
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
}): Result<{ hackInstructions: readonly string[] }> => {
  const hackInstructions: string[] = [];
  let nextVariableAddress = VARIABLE_ADDRESS_START;

  for (const [i, line] of assemblyProgram.entries()) {
    const lineNumber = i + 1;

    if (!isInstruction(line)) {
      continue;
    }

    if (line.startsWith("@")) {
      const address = line.slice(1);

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
      const destAndRest = line.split("=");

      if (destAndRest.length < 1 || destAndRest.length > 3) {
        return { success: false, message: error({ message: `instruction ${line} is invalid`, lineNumber }) };
      }

      if (destAndRest.length === 2) {
        const destSymbols = destAndRest.shift()?.split("") ?? [];

        for (const dest of destSymbols) {
          if (isValidDestCode(dest)) {
            cInstruction |= DEST_CODES[dest];
          } else {
            return {
              success: false,
              message: error({ message: `${dest} is not a valid destination register`, lineNumber }),
            };
          }
        }
      }

      const compAndJump = destAndRest.shift()?.split(";");
      const comp = compAndJump?.shift();

      if (!comp) {
        return {
          success: false,
          message: error({ message: `instruction ${line} is missing comp symbol`, lineNumber }),
        };
      }

      if (!isValidCompCode(comp)) {
        return { success: false, message: error({ message: `${comp} is not a valid comp symbol`, lineNumber }) };
      }

      cInstruction |= COMP_CODES[comp];

      if (isMemoryCompCode(comp)) {
        cInstruction |= MEMORY_COMP_CODE;
      }

      const jump = compAndJump?.shift();

      if (jump) {
        if (!isValidJumpCode(jump)) {
          return {
            success: false,
            message: error({ message: `${jump} is not a valid jump symbol`, lineNumber }),
          };
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
    console.log(error({ message: `unable to write hack instructions to file ${hackFileName}` }));
  }
};

main();
