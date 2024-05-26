import JackParseTree, { JackParseTreeNode } from "../parser/JackParseTree.js";
import JackParser from "../parser/JackParser.js";
import {
  Operator,
  UnaryOperator,
  isClassVarKeywordToken,
  isOperatorToken,
  isSeparatorToken,
  isSubroutineTypeToken,
  isTypeToken,
  isUnaryOperatorToken,
} from "../parser/utils.js";
import tokenize from "../tokenizer/index.js";
import { IdentifierToken } from "../tokenizer/types.js";
import { Result } from "../types.js";
import { ClassSymbolKind, SubroutineSymbolKind, SymbolTable } from "./SymbolTable.js";
import { VmInstruction } from "./types.js";
import { isStatementRule } from "./utils.js";

// TODO: ConvertToBin test
// TODO: Square test
// TODO: Average test
// TODO: Pong test

// TODO: make error messages better (log expected/actual)

type ClassContext = {
  symbolTable: SymbolTable<ClassSymbolKind>;
  className: string;
};

type SubroutineContext = {
  symbolTable: SymbolTable<SubroutineSymbolKind>;
};

export class JackCompiler {
  #jackParser = new JackParser();
  #_classContext: ClassContext | undefined = undefined;
  #_subroutineContext: SubroutineContext | undefined = undefined;

  get #classContext(): ClassContext {
    if (!this.#_classContext) {
      throw new Error(`[#classContext]: #_classContext is undefined`);
    }

    return this.#_classContext;
  }

  set #classContext(context: ClassContext | undefined) {
    this.#_classContext = context;
  }

  get #subroutineContext(): SubroutineContext {
    if (!this.#_subroutineContext) {
      throw new Error(`[#subroutineContext]: #_subroutineContext is undefined`);
    }

    return this.#_subroutineContext;
  }

  set #subroutineContext(context: SubroutineContext | undefined) {
    this.#_subroutineContext = context;
  }

  compile(jackProgram: string[]): Result<{ vmInstructions: VmInstruction[] }> {
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
      return { success: true, vmInstructions: this.#compile(jackParseTree) };
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : "TODO: error message handling" };
    }
  }

  #reset() {
    this.#classContext = undefined;
    this.#subroutineContext = undefined;
  }

  #compile(parseTree: JackParseTree): VmInstruction[] {
    console.log(parseTree.toXmlString());

    const classNode = parseTree.root;

    if (classNode.value.type !== "grammarRule" || classNode.value.rule !== "class") {
      // TODO: standardise error messages
      throw new Error(`[#compileClass]: expected class node but was ${classNode.value}`);
    }

    const classNameNode = classNode.children[1];

    if (!classNameNode || classNameNode.value.type !== "identifier") {
      throw new Error(`[#compileClass]: expected class name node but was ${classNameNode?.value}`);
    }

    this.#classContext = { symbolTable: new SymbolTable(), className: classNameNode.value.token };

    classNode.children
      .filter((c) => c.value.type === "grammarRule" && c.value.rule === "classVarDec")
      .forEach((node) => this.#compileClassVarDec({ classVarDecNode: node }));

    console.log("ClassSymbolTable");
    console.log(this.#classContext.symbolTable.toString());

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
      .forEach((identifier) => this.#classContext.symbolTable.add({ name: identifier.token, kind, type }));
  }

  #compileSubroutineDec({ subroutineDecNode }: { subroutineDecNode: JackParseTreeNode }): VmInstruction[] {
    const [subroutineTypeNode, returnTypeNode, subroutineNameNode] = subroutineDecNode.children;

    if (!subroutineTypeNode || !isSubroutineTypeToken(subroutineTypeNode.value)) {
      throw new Error(`[#compileSubroutineDec]: expected subroutine type node but was ${subroutineTypeNode?.value}`);
    }
    if (!subroutineNameNode || subroutineNameNode.value.type !== "identifier") {
      throw new Error(
        `[#compileSubroutineDec]: expected subroutine name node but was ${subroutineTypeNode?.value.type}`
      );
    }

    const subroutineType = subroutineTypeNode.value;
    const subroutineName = subroutineNameNode.value;

    // TODO: move this into a #resetSubroutineContext(context: Omit<context, "symbolTable") method if anything added to the context
    this.#subroutineContext = { symbolTable: new SymbolTable() };

    const subroutineBodyNode = subroutineDecNode.children.find(
      (n) => n.value.type === "grammarRule" && n.value.rule === "subroutineBody"
    );

    if (!subroutineBodyNode) {
      throw new Error(`[#compileSubroutineDec]: no subroutineBody node found`);
    }

    if (subroutineType.token === "method") {
      this.#subroutineContext.symbolTable.add({ name: "this", type: this.#classContext.className, kind: "arg" });
    }

    this.#compileParameterList({ subroutineDecNode });
    this.#compileVarDecs({ subroutineBodyNode });

    console.log("SubroutineSymbolTable");
    console.log(this.#subroutineContext.symbolTable.toString());

    const vmInstructions: VmInstruction[] = [
      `function ${this.#classContext.className}.${subroutineName.token} ${this.#subroutineContext.symbolTable.count(
        "var"
      )}`,
    ];

    if (subroutineType.token === "method") {
      // Aligns the virtual memory segment this (pointer 0) with the base address of the object on which the method was called
      vmInstructions.push("push argument 0", "pop pointer 0");
    } else if (subroutineType.token === "constructor") {
      // Allocates a memory block of nFields 16-bit words and aligns the virtual memory segment "this" (pointer 0) with the base address of the newly allocated block
      vmInstructions.push(
        `push constant ${this.#classContext.symbolTable.count("field")}`,
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

      this.#subroutineContext.symbolTable.add({ name: argName, kind: "arg", type });

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
        this.#subroutineContext.symbolTable.add({ name: node.value.token, kind: "var", type });
      });
    }
  }

  #compileSubroutineBody({ subroutineBodyNode }: { subroutineBodyNode: JackParseTreeNode }): VmInstruction[] {
    const statementsNode = subroutineBodyNode.children.find(
      (node) => node.value.type === "grammarRule" && node.value.rule === "statements"
    );

    if (!statementsNode) {
      throw new Error("[#compileSubroutineBody]: statements node not found");
    }

    return statementsNode.children.flatMap((statementNode) => this.#compileStatement(statementNode));
  }

  #compileStatement(statementNode: JackParseTreeNode): VmInstruction[] {
    if (!isStatementRule(statementNode.value)) {
      throw new Error(`[#compuleSubroutineBody]: expected statement node but was ${statementNode.value.type}`);
    }

    // TODO: compile letStatement
    // TODO: compile ifStatement
    // TODO: compile whileStatement

    switch (statementNode.value.rule) {
      case "letStatement":
        throw new Error(`[#compileSubroutineBody]: letStatement not implemented`);
      case "ifStatement":
        throw new Error(`[#compileSubroutineBody]: ifStatement not implemented`);
      case "whileStatement":
        throw new Error(`[#compileSubroutineBody]: whileStatement not implemented`);
      case "doStatement":
        return this.#compileDoStatement(statementNode);
      case "returnStatement":
        return this.#compileReturnStatement(statementNode);
    }
  }

  #compileDoStatement(doStatementNode: JackParseTreeNode): VmInstruction[] {
    const [doNode, ...subroutineCall] = doStatementNode.children;
    return [...this.#compileSubroutineCall(subroutineCall), "pop temp 0"];
  }

  #compileReturnStatement(returnStatementNode: JackParseTreeNode): VmInstruction[] {
    const vmInstructions: VmInstruction[] = [];

    const returnExpression = returnStatementNode.children.find(
      (node) => node.value.type === "grammarRule" && node.value.rule === "expression"
    );

    if (!returnExpression) {
      vmInstructions.push("push constant 0");
    } else {
      throw new Error(`[#compileReturnStatement]: return statement expression not implemented`);
    }

    vmInstructions.push("return");

    return vmInstructions;
  }

  #compileExpression(expressionNode: JackParseTreeNode): VmInstruction[] {
    const [firstTermNode, ...restExpression] = expressionNode.children;

    if (!firstTermNode || firstTermNode.value.type !== "grammarRule" || firstTermNode.value.rule !== "term") {
      throw new Error(`[#compileExpression]: invalid first term node, type: ${firstTermNode?.value.type}`);
    }

    const vmInstructions: VmInstruction[] = this.#compileTerm(firstTermNode);

    let currentNodeIndex = 0;
    while (currentNodeIndex < restExpression.length) {
      const operatorNode = restExpression[currentNodeIndex];
      currentNodeIndex++;

      const termNode = restExpression[currentNodeIndex];
      currentNodeIndex++;

      if (!operatorNode || !isOperatorToken(operatorNode.value)) {
        throw new Error(`[#compileExpression]: expected operator symbol node but was type ${operatorNode?.value.type}`);
      }
      if (!termNode || termNode.value.type !== "grammarRule" || termNode.value.rule !== "term") {
        throw new Error(`[#compileExpression]: invalid term node, type: ${termNode?.value.type}`);
      }

      vmInstructions.push(...this.#compileTerm(termNode));
      vmInstructions.push(this.#compileOperator(operatorNode.value.token));
    }

    return vmInstructions;
  }

  // TODO: stringConstant
  // TODO: keywordConstant ("this" must compile to "push pointer 0")
  // TODO: varName
  // TODO: varName[expression]
  // TODO: unaryOp term
  // TODO: subroutineCall
  #compileTerm(termNode: JackParseTreeNode): VmInstruction[] {
    // See the codeWrite() algorithm given in the textbook (page 293)
    const [first, ...restTerm] = termNode.children;

    if (!first) {
      throw new Error(`[#compileTerm]: first term is undefined`);
    }

    if (first.value.type === "integerConstant") {
      return [`push constant ${first.value.token}`];
    }

    if (first.value.type === "symbol") {
      if (first.value.token === "(") {
        const expressionNode = restTerm.find(
          (node) => node.value.type === "grammarRule" && node.value.rule === "expression"
        );

        if (!expressionNode) {
          throw new Error(`[#compileTerm]: did not find expression node when compiling "(expression)"`);
        }

        return this.#compileExpression(expressionNode);
      }

      if (isUnaryOperatorToken(first.value)) {
        const [term] = restTerm;

        if (!term || term.value.type !== "grammarRule" || term.value.rule !== "term") {
          throw new Error(`[#compileTerm]: did not find term following unary operator`);
        }

        return [...this.#compileTerm(term), this.#compileUnaryOperator(first.value.token)];
      }
    }

    console.log("Failing", first);
    throw new Error(`[#compileTerm]: term not implemented yet`);
  }

  #compileOperator(operator: Operator): VmInstruction {
    switch (operator) {
      case "+":
        return "add";
      case "-":
        return "sub";
      case "*":
        return "call Math.multiply 2";
      case "/":
        return "call Math.divide 2";
      case "&":
        return "and";
      case "|":
        return "or";
      case "<":
        return "lt";
      case ">":
        return "gt";
      case "=":
        return "eq";
    }
  }

  #compileUnaryOperator(operator: UnaryOperator): VmInstruction {
    switch (operator) {
      case "-":
        return "neg";
      case "~":
        return "not";
    }
  }

  // TODO: refactor this method when completed
  #compileSubroutineCall(subroutineCallNodes: JackParseTreeNode[]): VmInstruction[] {
    const expressionListNode = subroutineCallNodes.find(
      (node) => node.value.type === "grammarRule" && node.value.rule === "expressionList"
    );

    if (!expressionListNode) {
      throw new Error(`[#compileSubroutineCall]: no expression list found`);
    }

    const vmInstructions: VmInstruction[] = [];

    // TODO: compile Class.function() calls
    // TODO: compile variable.method() calls
    if (subroutineCallNodes.some((node) => node.value.type === "symbol" && node.value.token === ".")) {
      const [classOrVarNameNode, _, subroutineNameNode] = subroutineCallNodes;

      if (!classOrVarNameNode || classOrVarNameNode.value.type === "grammarRule") {
        throw new Error(`[#compileSubroutineCall]: invalid class or var name node`);
      }
      if (!subroutineNameNode || subroutineNameNode.value.type === "grammarRule") {
        throw new Error(`[#compileSubroutineCall]: invalid subroutine name node`);
      }

      if (this.#subroutineContext.symbolTable.has(classOrVarNameNode.value.token)) {
        throw new Error(`[#compileSubroutineCall]: variable.method() calls not implemented`);
      } else {
        vmInstructions.push(...this.#compileExpressionList(expressionListNode));
        vmInstructions.push(
          `call ${classOrVarNameNode.value.token}.${subroutineNameNode.value.token} ${expressionListNode.children.length}`
        );
      }
    } else {
      // TODO: compile method() calls (this.method())
      throw new Error(`[#compileSubroutineCall]: this.method() calls not implemented`);
    }

    return vmInstructions;
  }

  #compileExpressionList(expressionListNode: JackParseTreeNode): VmInstruction[] {
    return expressionListNode.children
      .filter((node) => node.value.type === "grammarRule" && node.value.rule === "expression")
      .flatMap((expressionNode) => this.#compileExpression(expressionNode));
  }
}
