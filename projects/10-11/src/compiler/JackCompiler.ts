import JackParser from "../parser/JackParser.js";
import tokenize from "../tokenizer/index.js";
import { Result } from "../types.js";

export class JackCompiler {
  private jackParser = new JackParser();

  public compile(jackProgram: string[]): Result<{ vmProgram: string }> {
    const tokenizeResult = tokenize(jackProgram);

    if (!tokenizeResult.success) {
      return tokenizeResult;
    }

    const { tokens } = tokenizeResult;

    const parseResult = this.jackParser.parse(tokens);

    if (!parseResult.success) {
      return parseResult;
    }

    const { jackParseTree } = parseResult;

    console.log(jackParseTree.toXmlString());

    // TODO: Add each classVarDec to class-level symbol table
    // TODO: Parse each subroutine and add parameters / var declarations to subroutine-level symbol table

    return { success: true, vmProgram: "TODO" };
  }
}
