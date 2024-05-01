import { Token } from "../tokenizer/types.js";
import { Result } from "../types.js";
import { JackParseTree } from "./JackParseTree.js";

export const parse = (tokens: readonly Token[]): Result<{ parseTree: JackParseTree }> => {
  return { success: true, parseTree: new JackParseTree({ grammarRule: "class" }) };
};
