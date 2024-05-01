import tokenize from "../tokenizer/index.js";
import { error } from "../utils/index.js";
import { getJackFiles, toJackProgram } from "../utils/jackFileUtils.js";
import { parse } from "./index.js";

const test = () => {
  const filePath = process.argv[2];

  if (!filePath) {
    console.log(error("missing program file path" + "\n" + "usage: pnpm vmTranslator ./path/to/Program.vm"));
    return;
  }

  const jackFilesResult = getJackFiles(filePath);

  if (!jackFilesResult.success) {
    console.log(jackFilesResult.message);
    return;
  }

  const { jackFiles } = jackFilesResult;

  for (const file of jackFiles) {
    const jackProgramResult = toJackProgram(file);

    if (!jackProgramResult.success) {
      console.log(jackProgramResult.message);
      return;
    }

    const { jackProgram } = jackProgramResult;

    const tokenizeResult = tokenize(jackProgram);

    if (!tokenizeResult.success) {
      console.log(tokenizeResult.message);
      return;
    }

    const { tokens } = tokenizeResult;

    // TODO: Parse tokens into parse tree
    const parseTreeResult = parse(tokens);

    if (!parseTreeResult.success) {
      console.log(parseTreeResult.message);
      return;
    }

    const { parseTree } = parseTreeResult;

    console.log(parseTree);

    // TODO: Convert parse tree to XML

    // const outfile = `${filePath}/${path.basename(file).replace(".jack", ".out.xml")}`;

    // try {
    //   writeFileSync(outfile, "TODO");
    // } catch {
    //   console.log(error(`unable to test output to file ${outfile}`));
    // }
  }
};

test();