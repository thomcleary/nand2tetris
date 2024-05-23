import JackParseTree, { JackParseTreeNode } from "../parser/JackParseTree.js";
import JackParser from "../parser/JackParser.js";
import { isClassVarKeywordToken, isSeparatorToken, isSubroutineTypeToken, isTypeToken } from "../parser/utils.js";
import tokenize from "../tokenizer/index.js";
import { IdentifierToken } from "../tokenizer/types.js";
import { Result } from "../types.js";
import { ClassSymbolKind, SubroutineSymbolKind, SymbolTable } from "./SymbolTable.js";
import { VmInstruction } from "./types.js";

// TODO: Seven Test
// Compile "do" statements

export class JackCompiler {
  #jackParser = new JackParser();
  #classSymbolTable = new SymbolTable<ClassSymbolKind>();
  #subroutineSymbolTable = new SymbolTable<SubroutineSymbolKind>();
  #_className: string | undefined = undefined;

  get #className() {
    if (!this.#_className) {
      throw new Error(`[#className]: #_className is undefined`);
    }

    return this.#_className;
  }

  set #className(name: string) {
    this.#_className = name;
  }

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
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : "TODO: error message handling" };
    }
  }

  #reset() {
    this.#classSymbolTable.clear();
    this.#subroutineSymbolTable.clear();
  }

  #compile(jackParseTree: JackParseTree): string {
    console.log(jackParseTree.toXmlString());

    const vmInstructions = this.#compileClass(jackParseTree);

    return vmInstructions.join("\n");
  }

  #compileClass(parseTree: JackParseTree): VmInstruction[] {
    const classNode = parseTree.root;

    if (classNode.value.type !== "grammarRule" || classNode.value.rule !== "class") {
      // TODO: standardise error messages
      throw new Error(`[#compileClass]: expected class node but was ${classNode.value}`);
    }

    const classNameNode = classNode.children[1];

    if (!classNameNode || classNameNode.value.type !== "identifier") {
      throw new Error(`[#compileClass]: expected class name node but was ${classNameNode?.value}`);
    }

    this.#className = classNameNode.value.token;

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
    if (!kindNode || !isClassVarKeywordToken(kindNode.value)) {
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

  #compileSubroutineDec({ subroutineDecNode }: { subroutineDecNode: JackParseTreeNode }): VmInstruction[] {
    const [
      subroutineTypeNode,
      _, //  returnTypeNode, TODO: might need to pass this down to compileSubroutineDec to validate return statement
      subroutineNameNode,
    ] = subroutineDecNode.children;

    if (!subroutineTypeNode || !isSubroutineTypeToken(subroutineTypeNode.value)) {
      throw new Error(`[#compileSubroutineDec]: expected subroutine type node but was ${subroutineTypeNode?.value}`);
    }
    // if (
    //   !returnTypeNode ||
    //   !(
    //     isTypeToken(returnTypeNode.value) ||
    //     (returnTypeNode.value.type === "keyword" && returnTypeNode.value.token === "void")
    //   )
    // ) {
    //   throw new Error(`[#compileSubroutineDec]: expected return type node but was ${subroutineTypeNode?.value}`);
    // }
    if (!subroutineNameNode || subroutineNameNode.value.type !== "identifier") {
      throw new Error(
        `[#compileSubroutineDec]: expected subroutine name node but was ${subroutineTypeNode?.value.type}`
      );
    }

    const subroutineType = subroutineTypeNode.value;
    // const returnType = returnTypeNode.value;
    const subroutineName = subroutineNameNode.value;

    const subroutineBodyNode = subroutineDecNode.children.find(
      (n) => n.value.type === "grammarRule" && n.value.rule === "subroutineBody"
    );

    if (!subroutineBodyNode) {
      throw new Error(`[#compileSubroutineDec]: no subroutineBody node found`);
    }

    this.#subroutineSymbolTable.clear();

    if (subroutineType.token === "method") {
      this.#subroutineSymbolTable.add({ name: "this", type: this.#className, kind: "arg" });
    }

    this.#compileParameterList({ subroutineDecNode });
    this.#compileVarDecs({ subroutineBodyNode });

    console.log("SubroutineSymbolTable");
    console.log(this.#subroutineSymbolTable.toString());

    const vmInstructions: VmInstruction[] = [
      `function ${this.#className}.${subroutineName.token} ${this.#subroutineSymbolTable.count("var")}`,
    ];

    if (subroutineType.token === "method") {
      // Aligns the virtual memory segment this (pointer 0)
      // with the base address of the object on which the method was called
      vmInstructions.push("push argument 0", "pop pointer 0");
    } else if (subroutineType.token === "constructor") {
      // Allocates a memory block of nFields 16-bit words
      // and aligns the virtual memory segment "this" (pointer 0)
      // with the base address of the newly allocated block
      vmInstructions.push(
        `push constant ${this.#classSymbolTable.count("field")}`,
        "call Memory.alloc 1",
        "pop pointer 0"
      );
    }

    vmInstructions.push(...this.#compileSubroutineBody({ subroutineBodyNode }));

    return vmInstructions;
  }

  #compileParameterList({ subroutineDecNode }: { subroutineDecNode: JackParseTreeNode }): void {
    const parameterListNode = subroutineDecNode.children.find(
      (n) => n.value.type === "grammarRule" && n.value.rule === "parameterList"
    );

    if (!parameterListNode) {
      throw new Error(`[#compileParameterList]: no parameterList node found`);
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

  #compileVarDecs({ subroutineBodyNode }: { subroutineBodyNode: JackParseTreeNode }): void {
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

  #compileSubroutineBody({ subroutineBodyNode }: { subroutineBodyNode: JackParseTreeNode }): VmInstruction[] {
    const vmInstructions: VmInstruction[] = [];
    // TODO: parse subroutine body into VM instructions

    // TODO: compile "do" statements;

    // TODO: if subroutine type is constructor, end with
    // push pointer 0
    // return
    // This sequence returns to the caller the base address of the new object created by the constructor.
    // if (subroutineType = "constructor") vmInstructions.push("push pointer 0");

    // TODO: if subroutine return type is void, end with
    // push constant 0
    // return
    // When compiling a void Jack method or function,
    // the convention is to end the generated code with push constant 0, return.
    // if (returnType === "void") vmInstructions.push("push constant 0");

    vmInstructions.push("return");

    return vmInstructions;
  }

  #compileDoStatement(): VmInstruction[] {
    // TODO

    return [];
  }

  #compileExpression(): VmInstruction[] {
    // TODO: constant expressions
    // TODO: variable expressions
    // TODO: compile "exp op exp" expressions
    // TODO: compile "op exp" expressions
    // TODO: compile function call expressions

    return [];
  }
}
