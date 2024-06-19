import { readFileSync, writeFileSync } from "fs";
import { assemble } from "./assembler.js";
import { Result } from "./types.js";
import { error, toAssemblyInstructions } from "./utils.js";

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

const getAssemblyInstructions = (filePath: string): Result<{ assemblyInstructions: readonly string[] }> => {
  try {
    return {
      success: true,
      assemblyInstructions: toAssemblyInstructions(readFileSync(filePath).toString()),
    };
  } catch {
    return { success: false, message: error({ message: `unable to read file ${filePath}` }) };
  }
};

const main = () => {
  const assemblyFilePathResult = getAssemblyFilePath();

  if (!assemblyFilePathResult.success) {
    console.log(assemblyFilePathResult.message);
    return;
  }

  const { filePath } = assemblyFilePathResult;
  const assemblyInstructionsResult = getAssemblyInstructions(filePath);

  if (!assemblyInstructionsResult.success) {
    console.log(assemblyInstructionsResult.message);
    return;
  }

  const { assemblyInstructions } = assemblyInstructionsResult;
  const assembleResult = assemble({ assemblyInstructions });

  if (!assembleResult.success) {
    console.log(assembleResult.message);
    return;
  }

  const { hackInstructions } = assembleResult;
  const hackFileName = filePath.replace(".asm", ".hack");

  try {
    writeFileSync(hackFileName, hackInstructions.join("\n"));
  } catch {
    console.log(error({ message: `unable to write hack instructions to file ${hackFileName}` }));
  }
};

main();
