import { writeFileSync } from "fs";
import path from "path";
import tokenize from "../tokenizer/index.js";
import { error } from "../utils/index.js";
import { getJackFiles, toJackProgram } from "../utils/io.js";
import JackParser from "./JackParser.js";

const test = () => {
  const filePath = process.argv[2];

  if (!filePath) {
    console.log(error("missing program file path" + "\n" + "usage: pnpm test:parser ./path/to/program"));
    return;
  }

  const jackFilesResult = getJackFiles(filePath);

  if (!jackFilesResult.success) {
    console.log(jackFilesResult.message);
    return;
  }

  const { jackFiles } = jackFilesResult;
  const jackParser = new JackParser();

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

    const parseResult = jackParser.parse(tokens);

    if (!parseResult.success) {
      console.log(parseResult.message);
      return;
    }

    const { jackParseTree } = parseResult;

    const outfile = `${filePath}/${path.basename(file).replace(".jack", ".out.xml")}`;

    try {
      writeFileSync(outfile, jackParseTree.toXmlString());
    } catch {
      console.log(error(`unable to test output to file ${outfile}`));
    }
  }
};

test();
