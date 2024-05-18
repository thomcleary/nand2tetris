import { error } from "../utils/index.js";
import { getJackFiles, toJackProgram } from "../utils/jackFileUtils.js";
import { JackCompiler } from "./JackCompiler.js";

const compiler = () => {
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

    const { vmProgram } = compilationResult;

    console.log({ vmProgram });

    // TODO: output compilation result to .vm file
    // const outfile = `${filePath}/${path.basename(file).replace(".jack", ".vm")}`;

    // try {
    //   writeFileSync(outfile, "TODO");
    // } catch {
    //   console.log(error(`unable to test output to file ${outfile}`));
    // }
  }
};

compiler();
