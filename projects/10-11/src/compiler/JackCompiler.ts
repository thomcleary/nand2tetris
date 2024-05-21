import JackParseTree, { JackParseTreeNode } from "../parser/JackParseTree.js";
import JackParser from "../parser/JackParser.js";
import { isSeparatorToken, isTypeToken } from "../parser/utils.js";
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

    console.log("ClassSymbolTable");
    console.log(this.#classSymbolTable.toString());
  }

  #compileSubroutineDec(subroutineDecNode: JackParseTreeNode): string[] {
    this.#resetSubroutineSymbolTable();

    // TODO: compile parameterList
    const parameterListNode = subroutineDecNode.children.find(
      (n) => n.value.type === "grammarRule" && n.value.rule === "parameterList"
    );

    if (!parameterListNode) {
      throw new Error(`[#compileSubroutineDec]: no parameterList node found`);
    }

    this.#compileParameterList(parameterListNode);

    // TODO: compile varDecs
    const varDecNodes = subroutineDecNode.children.filter(
      (c) => c.value.type === "grammarRule" && c.value.rule === "varDec"
    );

    console.log("SubroutineSymbolTable");
    console.log(this.#subroutineSymbolTable.toString());

    return ["TODO"];
  }

  #compileParameterList(parameterListNode: JackParseTreeNode) {
    const nodes = parameterListNode.children;

    let currentNodeIndex = 0;
    while (currentNodeIndex < nodes.length) {
      const typeNode = nodes[currentNodeIndex];
      if (!typeNode || typeNode.value.type === "grammarRule" || !isTypeToken(typeNode.value)) {
        throw new Error(`[#compileParameterList]: expected type token but was ${typeNode?.value}`);
      }

      const type = typeNode.value.token;
      currentNodeIndex++;

      const argNameNode = nodes[currentNodeIndex];
      if (!argNameNode || argNameNode.value.type !== "identifier") {
        throw new Error(`[#compileParameterList]: expected identifier token but was ${argNameNode?.value}`);
      }

      const argName = argNameNode.value.token;
      currentNodeIndex++;

      this.#subroutineSymbolTable.add({ name: argName, kind: "arg", type });

      const currentNode = nodes[currentNodeIndex];
      if (currentNode && currentNode.value.type !== "grammarRule" && isSeparatorToken(currentNode.value)) {
        currentNodeIndex++;
      }
    }
  }
}
