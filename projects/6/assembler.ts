import { readFileSync } from "fs";

type Result<T> = ({ success: true } & T) | { success: false; message: string | undefined };

const getAssemblyFilePath = (): Result<{ filePath: string }> => {
  const filePath = process.argv[2];

  if (!filePath) {
    return {
      success: false,
      message: "error: missing program file path" + "\n" + "usage: pnpm assembler ./path/to/program.asm",
    };
  }

  if (!filePath.endsWith(".asm")) {
    return {
      success: false,
      message: `error: file type of ${filePath} is not .asm`,
    };
  }

  return { success: true, filePath };
};

const getAssemblyProgram = (filePath: string): Result<{ assemblyProgram: string }> => {
  try {
    const assemblyProgram = readFileSync(filePath).toString().trim();

    // TODO: convert string into a representation that will be easier to parse
    // TODO: remove comments / empty lines etc

    return { success: true, assemblyProgram };
  } catch (e) {
    return { success: false, message: `error: unable to read file ${filePath}` };
  }
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
  console.log(assemblyProgram);

  // TODO: convert assemblyProgram to binary hack instructions

  // TODO: write binary hack instruction to ./path/to/pogram.hack
};

main();
