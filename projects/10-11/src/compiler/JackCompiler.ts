import JackParseTree, { JackParseTreeNode } from "../parser/JackParseTree.js";
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

  compile(jackProgram: string[]): Result<{ vmProgram: string }> {
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
    console.log(jackParseTree.toXmlString());

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
      .filter((c) => c.value.type === "grammarRule" && c.value.rule === "classVarDec")
      .forEach((dec) => this.#compileClassVarDec(dec));

    classNode.children
      .filter((c) => c.value.type === "grammarRule" && c.value.rule === "subroutineDec")
      .forEach((dec) => this.#compileSubroutineDec(dec));

    return ["TODO"];
  }

  #compileClassVarDec(classVarDecNode: JackParseTreeNode): void {
    const declaration = classVarDecNode.children;

    const kindNode = declaration[0];
    if (
      !kindNode ||
      kindNode.value.type !== "keyword" ||
      (kindNode.value.token !== "static" && kindNode.value.token !== "field")
    ) {
      throw new Error(`[#compileClassVarDec]: expected static/field but was ${kindNode?.value}`);
    }

    const kind = kindNode.value.token;

    const typeNode = declaration[1];
    if (!typeNode || typeNode.value.type === "grammarRule" || !isTypeToken(typeNode.value)) {
      throw new Error(`[#compileClassVarDec]: expected type token but was ${typeNode?.value}`);
    }

    const type = typeNode.value.type;

    declaration
      .slice(2)
      .map((node) => node.value)
      .filter((token): token is IdentifierToken => token.type === "identifier")
      .forEach((identifier) => this.#classSymbolTable.add({ name: identifier.token, kind, type }));

    console.log(this.#classSymbolTable.toString());
  }

  #compileSubroutineDec(subroutineDecNode: JackParseTreeNode): string[] {
    this.#resetSubroutineSymbolTable();

    // TODO: Parse each subroutine and add parameters / var declarations to subroutine-level symbol table
    // console.log(this.#subroutineSymbolTable)

    return ["TODO"];
  }
}
