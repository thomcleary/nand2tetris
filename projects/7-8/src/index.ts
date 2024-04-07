import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { Result } from "./types.js";
import { error } from "./utils.js";
import { translate } from "./vmTranslator.js";

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

const main = () => {
  // TODO: FibonacciElement.tst - translate single VM file or each VM file in a directory
  // 1. Test on /NestedCall first (only 1 file in dir)
  // 2. Make sure single file also still works, SimpleFunction/SimpleFunction.vm
  // 3. Start testing on /FibonacciElement
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

  const { vmProgram } = vmProgramResult;
  const fileName = path.basename(filePath).replace(".vm", "");
  const translateResult = translate({ vmProgram, fileName });

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
