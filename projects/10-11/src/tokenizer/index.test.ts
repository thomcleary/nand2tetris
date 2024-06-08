import { writeFileSync } from "fs";
import path from "path";
import { Token } from "../types/Token.js";
import { error, toJackProgram } from "../utils/index.js";
import { getJackFileContents, getJackFilePaths } from "../utils/io.js";
import { escapeToken } from "../utils/testing.js";
import tokenize from "./index.js";

const tokenToXml = ({ type, token }: Token) => `<${type}> ${escapeToken(token)} </${type}>`;

const tokensToXml = (tokens: readonly Token[]): string => `<tokens>\n${tokens.map(tokenToXml).join("\n")}\n</tokens>\n`;

const test = () => {
  const filePath = process.argv[2];

  if (!filePath) {
    console.log(error("missing program file path" + "\n" + "usage: pnpm test:tokenizer ./path/to/program"));
    return;
  }

  const jackFilePathsResult = getJackFilePaths(filePath);

  if (!jackFilePathsResult.success) {
    console.log(jackFilePathsResult.message);
    return;
  }

  const { jackFilePaths } = jackFilePathsResult;

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

    const xml = tokensToXml(tokens);
    const outfile = `${filePath}/${path.basename(filePath).replace(".jack", "T.out.xml")}`;

    try {
      writeFileSync(outfile, xml);
    } catch {
      console.log(error(`unable to test output to file ${outfile}`));
    }
  }
};

test();
