import JackParseTree from "../parser/JackParseTree.js";
import JackParser from "../parser/JackParser.js";
import { isTypeToken } from "../parser/utils.js";
import tokenize from "../tokenizer/index.js";
import { IdentifierToken } from "../tokenizer/types.js";
import { Result } from "../types.js";
import { ClassSymbolKind, SubroutineSymbolKind, SymbolTable } from "./SymbolTable.js";

export class JackCompiler {
  #jackParser = new JackParser();
  #classSymbolTable = new SymbolTable<ClassSymbolKind>();
  #subroutineSymbolTable = new SymbolTable<SubroutineSymbolKind>();

  public compile(jackProgram: string[]): Result<{ vmProgram: string }> {
    const tokenizeResult = tokenize(jackProgram);

    if (!tokenizeResult.success) {
      return tokenizeResult;
    }

    const { tokens } = tokenizeResult;

    const parseResult = this.#jackParser.parse(tokens);

    if (!parseResult.success) {
      return parseResult;
    }

    const { jackParseTree } = parseResult;

    try {
      this.#reset();
      return { success: true, vmProgram: this.#compile(jackParseTree) };
    } catch {
      return { success: false, message: "TODO: error message handling" };
    }
  }

  #reset() {
    this.#classSymbolTable = new SymbolTable();
    this.#resetSubroutineSymbolTable();
  }

  #resetSubroutineSymbolTable() {
    this.#subroutineSymbolTable = new SymbolTable();
  }

  #compile(jackParseTree: JackParseTree): string {
    // console.log("Before #compileClass");
    // console.log(jackParseTree.toXmlString());

    const vmInstructions = this.#compileClass(jackParseTree);

    return "TODO";
  }

  #compileClass(parseTree: JackParseTree): string[] {
    const classNode = parseTree.root;

    if (classNode.value.type !== "grammarRule" || classNode.value.rule !== "class") {
      // TODO: standardise error messages
      throw new Error(`[#compileClass]: expected class node but was ${classNode.value}`);
    }

    classNode.children
      .filter((c) => c.root.value.type === "grammarRule" && c.root.value.rule === "classVarDec")
      .forEach((dec) => this.#compileClassVarDec(dec));

    return ["TODO"];
  }

  #compileClassVarDec(classVarDecTree: JackParseTree): void {
    const declaration = classVarDecTree.root.children;

    const kindNode = declaration[0];
    if (
      !kindNode ||
      kindNode.root.value.type !== "keyword" ||
      (kindNode.root.value.token !== "static" && kindNode.root.value.token !== "field")
    ) {
      throw new Error(`[#compileClassVarDec]: expected static/field but was ${kindNode?.root.value}`);
    }

    const kind = kindNode.root.value.token;

    const typeNode = declaration[1];
    if (!typeNode || typeNode.root.value.type === "grammarRule" || !isTypeToken(typeNode.root.value)) {
      throw new Error(`[#compileClassVarDec]: expected type token but was ${typeNode?.root.value}`);
    }

    const type = typeNode.root.value.type;

    declaration
      .slice(2)
      .map((tree) => tree.root.value)
      .filter((token): token is IdentifierToken => token.type === "identifier")
      .forEach((identifier) => this.#classSymbolTable.add({ name: identifier.token, kind, type }));

    console.log(this.#classSymbolTable.toString());
  }

  #compileSubroutine(): string[] {
    this.#resetSubroutineSymbolTable();

    // TODO: Parse each subroutine and add parameters / var declarations to subroutine-level symbol table
    // console.log(this.#subroutineSymbolTable)

    return ["TODO"];
  }
}
