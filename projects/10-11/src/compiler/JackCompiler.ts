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

    return vmInstructions.join("\n");
  }

  #compileClass(parseTree: JackParseTree): string[] {
    const classNode = parseTree.root;

    if (classNode.value.type !== "grammarRule" || classNode.value.rule !== "class") {
      // TODO: standardise error messages
      throw new Error(`[#compileClass]: expected class node but was ${classNode.value}`);
    }

    classNode.children
      .filter((c) => c.value.type === "grammarRule" && c.value.rule === "classVarDec")
      .forEach((node) => this.#compileClassVarDec({ classVarDecNode: node }));

    console.log("ClassSymbolTable");
    console.log(this.#classSymbolTable.toString());

    const vmInstructions = classNode.children
      .filter((c) => c.value.type === "grammarRule" && c.value.rule === "subroutineDec")
      .flatMap((node) => this.#compileSubroutineDec({ subroutineDecNode: node }));

    return vmInstructions;
  }

  #compileClassVarDec({ classVarDecNode }: { classVarDecNode: JackParseTreeNode }): void {
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
    if (!typeNode || !isTypeToken(typeNode.value)) {
      throw new Error(`[#compileClassVarDec]: expected type token but was ${typeNode?.value}`);
    }

    const type = typeNode.value.type;

    declaration
      .slice(2)
      .map((node) => node.value)
      .filter((token): token is IdentifierToken => token.type === "identifier")
      .forEach((identifier) => this.#classSymbolTable.add({ name: identifier.token, kind, type }));
  }

  #compileSubroutineDec({ subroutineDecNode }: { subroutineDecNode: JackParseTreeNode }): string[] {
    const subroutineBodyNode = subroutineDecNode.children.find(
      (n) => n.value.type === "grammarRule" && n.value.rule === "subroutineBody"
    );

    if (!subroutineBodyNode) {
      throw new Error(`[#compileSubroutineDec]: no subroutineBody node found`);
    }

    this.#resetSubroutineSymbolTable();
    // TODO: if subroutine is a method, add <this, className, arg, 0> to symbol table
    this.#compileParameterList({ subroutineDecNode });
    this.#compileVarDecs({ subroutineBodyNode });

    // TODO: generate VM instruction for function definition
    // function ClassName.functionName nArgs
    let vmInstructions: string[] = [];
    const [subroutineType, returnType, subroutineName] = subroutineDecNode.children;
    // TODO: validate these 3 first before creating instruction

    console.log("SubroutineSymbolTable");
    console.log(this.#subroutineSymbolTable.toString());

    vmInstructions.push(...this.#compileSubroutineBody({ subroutineBodyNode }));

    return vmInstructions;
  }

  #compileParameterList({ subroutineDecNode }: { subroutineDecNode: JackParseTreeNode }) {
    const parameterListNode = subroutineDecNode.children.find(
      (n) => n.value.type === "grammarRule" && n.value.rule === "parameterList"
    );

    if (!parameterListNode) {
      throw new Error(`[#compileSubroutineDec]: no parameterList node found`);
    }

    const nodes = parameterListNode.children;

    let currentNodeIndex = 0;
    while (currentNodeIndex < nodes.length) {
      const typeNode = nodes[currentNodeIndex];
      if (!typeNode || !isTypeToken(typeNode.value)) {
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

  #compileVarDecs({ subroutineBodyNode }: { subroutineBodyNode: JackParseTreeNode }) {
    const varDecNodes = subroutineBodyNode.children.filter(
      (c) => c.value.type === "grammarRule" && c.value.rule === "varDec"
    );

    for (const varDecNode of varDecNodes) {
      const varNodes = varDecNode.children.filter(
        (n) => !(n.value.type === "keyword" && n.value.token === "var") && n.value.type !== "symbol"
      );

      const typeNode = varNodes.shift();
      if (!typeNode || !isTypeToken(typeNode.value)) {
        throw new Error(`[#compileVarDecs]: expected type node but was ${typeNode?.value}`);
      }

      const type = typeNode.value.token;

      varNodes.forEach((node) => {
        if (!(node.value.type === "identifier")) {
          throw new Error(`[#compileVarDecs]: expected identifier token but was ${node.value}`);
        }
        this.#subroutineSymbolTable.add({ name: node.value.token, kind: "var", type });
      });
    }
  }

  #compileSubroutineBody({ subroutineBodyNode }: { subroutineBodyNode: JackParseTreeNode }): string[] {
    // TODO: parse subroutine body into VM instructions
    return ["TODO: #compileSubroutineBody"];
  }
}
