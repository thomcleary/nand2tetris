import { writeFileSync } from "fs";
import path from "path";
import { Token } from "../types.js";
import { error } from "../utils/index.js";
import { getJackFiles, toJackProgram } from "../utils/jackFileUtils.js";
import tokenize from "./index.js";

const XmlConflicts = {
  "<": "&lt;",
  ">": "&gt;",
  [`"`]: "&quot;",
  "&": "&amp;",
} as const satisfies Record<"<" | ">" | '"' | "&", `&${string};`>;

const isXmlConflict = (token: string): token is keyof typeof XmlConflicts => Object.keys(XmlConflicts).includes(token);

const escapeToken = (token: string) => (isXmlConflict(token) ? XmlConflicts[token] : token);

const tokenToXml = ({ type, token }: Token) => `<${type}> ${escapeToken(token)} </${type}>`;

const tokensToXml = (tokens: readonly Token[]): string => `<tokens>\n${tokens.map(tokenToXml).join("\n")}\n</tokens>\n`;

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

    const xml = tokensToXml(tokens);
    const outfile = `${filePath}/${path.basename(file).replace(".jack", "T.out.xml")}`;

    try {
      writeFileSync(outfile, xml);
    } catch {
      console.log(error(`unable to test output to file ${outfile}`));
    }
  }
};

test();