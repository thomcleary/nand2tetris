import { writeFileSync } from "fs";
import path from "path";
import tokenize from "../tokenizer/index.js";
import { error, toJackProgram } from "../utils/index.js";
import { getJackFileContents, getJackFilePaths } from "../utils/io.js";
import JackParser from "./JackParser.js";

const test = () => {
  const filePath = process.argv[2];

  if (!filePath) {
    console.log(error("missing program file path" + "\n" + "usage: pnpm test:parser ./path/to/program"));
    return;
  }

  const jackFilePathsResult = getJackFilePaths(filePath);

  if (!jackFilePathsResult.success) {
    console.log(jackFilePathsResult.message);
    return;
  }

  const { jackFilePaths } = jackFilePathsResult;
  const jackParser = new JackParser();

  for (const filePath of jackFilePaths) {
    const jackFileContentsResult = getJackFileContents(filePath);

    if (!jackFileContentsResult.success) {
      console.log(jackFileContentsResult.message);
      return;
    }

    const { jackFileContents } = jackFileContentsResult;
    const jackProgram = toJackProgram(jackFileContents);

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

    const outfile = `${filePath}/${path.basename(filePath).replace(".jack", ".out.xml")}`;

    try {
      writeFileSync(outfile, jackParseTree.toXmlString());
    } catch {
      console.log(error(`unable to test output to file ${outfile}`));
    }
  }
};

test();
