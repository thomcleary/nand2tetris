import { writeFileSync } from "fs";
import path from "path";
import { JackCompiler } from "./compiler/JackCompiler.js";
import { error } from "./utils/index.js";
import { getJackFiles, toJackProgram } from "./utils/jackFileUtils.js";

// TODO: refactor project structure
// - all shared constants to /src/constants.ts
// - all shared utils to /src/utils/*.ts
// - all shared types to /src/types.ts

const main = () => {
  const filePath = process.argv[2];

  if (!filePath) {
    console.log(error("missing program file path" + "\n" + "usage: pnpm compiler ./path/to/program"));
    return;
  }

  const jackFilesResult = getJackFiles(filePath);

  if (!jackFilesResult.success) {
    console.log(jackFilesResult.message);
    return;
  }

  const { jackFiles } = jackFilesResult;
  const jackCompiler = new JackCompiler();

  for (const file of jackFiles) {
    const jackProgramResult = toJackProgram(file);

    if (!jackProgramResult.success) {
      console.log(jackProgramResult.message);
      return;
    }

    const { jackProgram } = jackProgramResult;

    const compilationResult = jackCompiler.compile(jackProgram);

    if (!compilationResult.success) {
      console.log(compilationResult.message);
      return;
    }

    const { vmInstructions } = compilationResult;

    console.log("VM Instructions");
    console.log(vmInstructions);

    const outfile = `${filePath}/${path.basename(file).replace(".jack", ".vm")}`;

    try {
      writeFileSync(outfile, vmInstructions.join("\n"));
    } catch {
      console.log(error(`unable to test output to file ${outfile}`));
    }
  }
};

main();
