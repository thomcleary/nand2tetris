import { writeFileSync } from "fs";
import path from "path";
import JackCompiler from "./compiler/JackCompiler.js";
import { error } from "./utils/index.js";
import { getJackFileContents, getJackFilePaths } from "./utils/io.js";

const main = () => {
  const filePath = process.argv[2];

  if (!filePath) {
    console.log(error("missing program file path" + "\n" + "usage: pnpm compiler ./path/to/program"));
    return;
  }

  const jackFilePathsResult = getJackFilePaths(filePath);

  if (!jackFilePathsResult.success) {
    console.log(jackFilePathsResult.message);
    return;
  }

  const { jackFilePaths } = jackFilePathsResult;
  const jackCompiler = new JackCompiler();

  for (const filePath of jackFilePaths) {
    const jackFileContentsResult = getJackFileContents(filePath);

    if (!jackFileContentsResult.success) {
      console.log(jackFileContentsResult.message);
      return;
    }

    const { jackFileContents } = jackFileContentsResult;

    const compilationResult = jackCompiler.compile({ jackFileContents });

    if (!compilationResult.success) {
      console.log(compilationResult.message);
      return;
    }

    const { vmInstructions } = compilationResult;

    console.log(`${filePath} compiled`);

    const outfile = `${filePath}/${path.basename(filePath).replace(".jack", ".vm")}`;

    try {
      writeFileSync(outfile, vmInstructions.join("\n"));
    } catch {
      console.log(error(`unable to test output to file ${outfile}`));
    }
  }
};

main();
