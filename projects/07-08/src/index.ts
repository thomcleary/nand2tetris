import { existsSync, lstatSync, readFileSync, readdirSync, writeFileSync } from "fs";
import path from "path";
import { bootstrap } from "./bootstrap.js";
import { Result } from "./types.js";
import { error } from "./utils.js";
import { translate } from "./vmTranslator.js";

const getVmFiles = (): Result<{ vmFiles: readonly string[]; outfile: string }> => {
  const filePath = process.argv[2];

  if (!filePath) {
    return {
      success: false,
      message: error("missing program file path" + "\n" + "usage: pnpm vmTranslator ./path/to/Program.vm"),
    };
  }

  if (!existsSync(filePath)) {
    return { success: false, message: error(`${filePath} does not exist`) };
  }

  if (!lstatSync(filePath).isDirectory()) {
    return !filePath.endsWith(".vm")
      ? { success: false, message: error(`file type of ${filePath} is not .vm`) }
      : { success: true, vmFiles: [filePath], outfile: filePath.replace(".vm", ".asm") };
  }

  const vmFiles = readdirSync(filePath)
    .filter((f) => f.endsWith(".vm"))
    .map((f) => `${filePath}/${f}`);

  return vmFiles.length > 0
    ? { success: true, vmFiles, outfile: `${filePath}/${path.basename(filePath)}.asm` }
    : { success: false, message: `No .vm files found in ${filePath}` };
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
  const vmFilesResult = getVmFiles();

  if (!vmFilesResult.success) {
    console.log(vmFilesResult.message);
    return;
  }

  const { vmFiles, outfile } = vmFilesResult;
  const assemblyInstructions = bootstrap();

  for (const vmFilePath of vmFiles) {
    const vmProgramResult = getVmProgram(vmFilePath);

    if (!vmProgramResult.success) {
      console.log(vmProgramResult.message);
      return;
    }

    const { vmProgram } = vmProgramResult;
    const fileName = path.basename(vmFilePath).replace(".vm", "");
    const translateResult = translate({ vmProgram, fileName });

    if (!translateResult.success) {
      console.log(translateResult.message);
      return;
    }

    assemblyInstructions.push(...translateResult.assemblyInstructions);
  }

  try {
    writeFileSync(outfile, assemblyInstructions.join("\n"));
  } catch {
    console.log(error(`unable to write assembly instructions to file ${outfile}`));
  }
};

main();
