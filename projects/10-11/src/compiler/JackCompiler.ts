import JackParseTree, { JackParseTreeNode } from "../parser/JackParseTree.js";
import JackParser from "../parser/JackParser.js";
import tokenize from "../tokenizer/index.js";
import {
  IdentifierToken,
  IntegerConstantToken,
  KeywordConstantToken,
  Operator,
  StringConstantToken,
  UnaryOperator,
} from "../types/Token.js";
import { VmInstruction } from "../types/VmInstruction.js";
import { Result } from "../types/index.js";
import {
  isClassVarKeyword,
  isKeywordConstant,
  isNode,
  isOperator,
  isSeparator,
  isStatementRule,
  isSubroutineType,
  isType,
  isUnaryOperator,
} from "../utils/predicates.js";
import JackCompilerError from "./JackCompilerError.js";
import SymbolTable, { ClassSymbolKind, SubroutineSymbolKind } from "./SymbolTable.js";

// TODO: Could add unit tests each time once passes with expected VmInstructions
// TODO: ConvertToBin test
// TODO: Square test
// TODO: Average test
// TODO: Pong test

type ClassContext = {
  readonly symbolTable: SymbolTable<ClassSymbolKind>;
  readonly className: string;
  ifCount: number;
  whileCount: number;
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
      throw new JackCompilerError({ caller: "#classContext", message: "#_classContext is undefined" });
    }

    return this.#_classContext;
  }

  set #classContext(context: ClassContext | undefined) {
    this.#_classContext = context;
  }

  get #subroutineContext(): SubroutineContext {
    if (!this.#_subroutineContext) {
      throw new JackCompilerError({ caller: "#subroutineContext", message: "#_subroutineContext is undefined" });
    }

    return this.#_subroutineContext;
  }

  set #subroutineContext(context: SubroutineContext | undefined) {
    this.#_subroutineContext = context;
  }

  #getVariableInfo(name: string) {
    const variableInfo = this.#subroutineContext.symbolTable.get(name) ?? this.#classContext.symbolTable.get(name);

    if (!variableInfo) {
      throw new JackCompilerError({
        caller: this.#getVariableInfo.name,
        message: `variable ${name} was not found in subroutine or class symbol table`,
      });
    }

    return variableInfo;
  }

  #resetClassContext(className: string) {
    this.#classContext = { symbolTable: new SymbolTable(), className, ifCount: 0, whileCount: 0 };
  }

  #resetSubroutineContext() {
    this.#subroutineContext = { symbolTable: new SymbolTable() };
  }

  #reset() {
    this.#classContext = undefined;
    this.#subroutineContext = undefined;
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
      return { success: false, message: e instanceof Error ? e.message : "Compilation failed (no error provided)" };
    }
  }

  #compile(parseTree: JackParseTree): VmInstruction[] {
    const caller = this.#compile.name;
    // TODO: remove
    console.log(parseTree.toXmlString());

    const classNode = parseTree.root;

    if (!isNode(classNode.value, { type: "grammarRule", rule: "class" })) {
      throw new JackCompilerError({ caller, message: `expected class node but was ${classNode.value}` });
    }

    const classNameNode = classNode.children[1];

    if (!classNameNode || classNameNode.value.type !== "identifier") {
      throw new JackCompilerError({ caller, message: `expected class name node but was ${classNameNode?.value}` });
    }

    this.#resetClassContext(classNameNode.value.token);

    classNode.children
      .filter(({ value }) => isNode(value, { type: "grammarRule", rule: "classVarDec" }))
      .forEach((classVarDecNode) => this.#compileClassVarDec({ classVarDecNode }));

    // TODO: remove
    console.log("ClassSymbolTable");
    console.log(this.#classContext.symbolTable.toString());

    const vmInstructions = classNode.children
      .filter(({ value }) => isNode(value, { type: "grammarRule", rule: "subroutineDec" }))
      .flatMap((subroutineDecNode) => this.#compileSubroutineDec({ subroutineDecNode }));

    return vmInstructions;
  }

  #compileClassVarDec({ classVarDecNode }: { classVarDecNode: JackParseTreeNode }): void {
    const caller = this.#compileClassVarDec.name;

    const declaration = classVarDecNode.children;

    const kindNode = declaration[0];
    if (!kindNode || !isClassVarKeyword(kindNode.value)) {
      throw new JackCompilerError({ caller, message: `expected static/field but was ${kindNode?.value}` });
    }

    const kind = kindNode.value.token;

    const typeNode = declaration[1];
    if (!typeNode || !isType(typeNode.value)) {
      throw new JackCompilerError({ caller, message: `expected type token but was ${typeNode?.value}` });
    }

    const type = typeNode.value.type;

    declaration
      .slice(2)
      .map((node) => node.value)
      .filter((token): token is IdentifierToken => token.type === "identifier")
      .forEach((identifier) => this.#classContext.symbolTable.add({ name: identifier.token, kind, type }));
  }

  #compileSubroutineDec({ subroutineDecNode }: { subroutineDecNode: JackParseTreeNode }): VmInstruction[] {
    const caller = this.#compileSubroutineDec.name;

    const [subroutineTypeNode, returnTypeNode, subroutineNameNode] = subroutineDecNode.children;

    if (!subroutineTypeNode || !isSubroutineType(subroutineTypeNode.value)) {
      throw new JackCompilerError({
        caller,
        message: `expected subroutine type node but was ${subroutineTypeNode?.value}`,
      });
    }
    if (!subroutineNameNode || subroutineNameNode.value.type !== "identifier") {
      throw new JackCompilerError({
        caller,
        message: `expected subroutine name node but was ${subroutineTypeNode?.value.type}`,
      });
    }

    const subroutineType = subroutineTypeNode.value;
    const subroutineName = subroutineNameNode.value;

    this.#resetSubroutineContext();

    const subroutineBodyNode = subroutineDecNode.children.find(({ value }) =>
      isNode(value, { type: "grammarRule", rule: "subroutineBody" })
    );

    if (!subroutineBodyNode) {
      throw new JackCompilerError({ caller, message: `no subroutineBody node found` });
    }

    if (subroutineType.token === "method") {
      this.#subroutineContext.symbolTable.add({ name: "this", type: this.#classContext.className, kind: "arg" });
    }

    this.#compileParameterList({ subroutineDecNode });
    this.#compileVarDecs({ subroutineBodyNode });

    // TODO: remove
    console.log("SubroutineSymbolTable");
    console.log(this.#subroutineContext.symbolTable.toString());

    const vmInstructions: VmInstruction[] = [
      `function ${this.#classContext.className}.${subroutineName.token} ${this.#subroutineContext.symbolTable.count(
        "var"
      )}`,
    ];

    if (subroutineType.token === "constructor") {
      // Allocates a memory block of nFields 16-bit words and aligns the virtual memory segment "this" (pointer 0) with the base address of the newly allocated block
      vmInstructions.push(
        `push constant ${this.#classContext.symbolTable.count("field")}`,
        "call Memory.alloc 1",
        "pop pointer 0"
      );
    } else if (subroutineType.token === "method") {
      // Aligns the virtual memory segment this (pointer 0) with the base address of the object on which the method was called
      vmInstructions.push("push argument 0", "pop pointer 0");
    }

    vmInstructions.push(...this.#compileSubroutineBody({ subroutineBodyNode }));

    return vmInstructions;
  }

  #compileParameterList({ subroutineDecNode }: { subroutineDecNode: JackParseTreeNode }): void {
    const caller = this.#compileParameterList.name;

    const parameterListNode = subroutineDecNode.children.find(({ value }) =>
      isNode(value, { type: "grammarRule", rule: "parameterList" })
    );

    if (!parameterListNode) {
      throw new JackCompilerError({ caller, message: `no parameterList node found` });
    }

    const nodes = parameterListNode.children;

    let currentNodeIndex = 0;

    while (currentNodeIndex < nodes.length) {
      const typeNode = nodes[currentNodeIndex];
      if (!typeNode || !isType(typeNode.value)) {
        throw new JackCompilerError({ caller, message: `expected type token but was ${typeNode?.value}` });
      }

      const type = typeNode.value.token;
      currentNodeIndex++;

      const argNameNode = nodes[currentNodeIndex];
      if (!argNameNode || argNameNode.value.type !== "identifier") {
        throw new JackCompilerError({ caller, message: `expected identifier token but was ${argNameNode?.value}` });
      }

      const argName = argNameNode.value.token;
      currentNodeIndex++;

      this.#subroutineContext.symbolTable.add({ name: argName, kind: "arg", type });

      const currentNode = nodes[currentNodeIndex];
      if (currentNode && currentNode.value.type !== "grammarRule" && isSeparator(currentNode.value)) {
        currentNodeIndex++;
      }
    }
  }

  #compileVarDecs({ subroutineBodyNode }: { subroutineBodyNode: JackParseTreeNode }): void {
    const caller = this.#compileVarDecs.name;

    const varDecNodes = subroutineBodyNode.children.filter(({ value }) =>
      isNode(value, { type: "grammarRule", rule: "varDec" })
    );

    for (const varDecNode of varDecNodes) {
      const varNodes = varDecNode.children.filter(
        ({ value }) => !isNode(value, { type: "keyword", token: "var" }) && value.type !== "symbol"
      );

      const typeNode = varNodes.shift();
      if (!typeNode || !isType(typeNode.value)) {
        throw new JackCompilerError({ caller, message: `expected type node but was ${typeNode?.value}` });
      }

      const type = typeNode.value.token;

      varNodes.forEach((node) => {
        if (!(node.value.type === "identifier")) {
          throw new JackCompilerError({ caller, message: `expected identifier token but was ${node.value}` });
        }
        this.#subroutineContext.symbolTable.add({ name: node.value.token, kind: "var", type });
      });
    }
  }

  #compileSubroutineBody({ subroutineBodyNode }: { subroutineBodyNode: JackParseTreeNode }): VmInstruction[] {
    const caller = this.#compileSubroutineBody.name;

    const statementsNode = subroutineBodyNode.children.find(({ value }) =>
      isNode(value, { type: "grammarRule", rule: "statements" })
    );

    if (!statementsNode) {
      throw new JackCompilerError({ caller, message: `statements node not found` });
    }

    return this.#compileStatements(statementsNode);
  }

  #compileStatements(statementsNode: JackParseTreeNode): VmInstruction[] {
    return statementsNode.children.flatMap((statementNode) => this.#compileStatement(statementNode));
  }

  #compileStatement(statementNode: JackParseTreeNode): VmInstruction[] {
    const caller = this.#compileStatement.name;

    if (!isStatementRule(statementNode.value)) {
      throw new JackCompilerError({ caller, message: `expected statement node but was ${statementNode.value.type}` });
    }

    switch (statementNode.value.rule) {
      case "letStatement":
        return this.#compileLetStatement(statementNode);
      case "ifStatement":
        return this.#compileIfStatement(statementNode);
      case "whileStatement":
        return this.#compileWhileStatement(statementNode);
      case "doStatement":
        return this.#compileDoStatement(statementNode);
      case "returnStatement":
        return this.#compileReturnStatement(statementNode);
    }
  }

  #compileLetStatement(letStatementNode: JackParseTreeNode): VmInstruction[] {
    const caller = this.#compileLetStatement.name;

    const [letNode, varNameNode, arrayIndexOrSymbolNode, ...restLetStatement] = letStatementNode.children;
    const [firstExpression, secondExpression] = restLetStatement.filter(({ value }) =>
      isNode(value, { type: "grammarRule", rule: "expression" })
    );

    if (!varNameNode || varNameNode.value.type !== "identifier") {
      throw new JackCompilerError({ caller, message: `expected var name node but was ${varNameNode?.value.type}` });
    }
    if (!firstExpression || !isNode(firstExpression.value, { type: "grammarRule", rule: "expression" })) {
      throw new JackCompilerError({ caller, message: `no expressions found` });
    }

    if (
      !arrayIndexOrSymbolNode ||
      !isNode(arrayIndexOrSymbolNode.value, [
        { type: "symbol", token: "[" },
        { type: "symbol", token: "=" },
      ])
    ) {
      throw new JackCompilerError({ caller, message: `expected "[" or "=" node but was ${varNameNode?.value.type}` });
    }

    if (arrayIndexOrSymbolNode.value.token === "[") {
      if (!secondExpression || !isNode(secondExpression.value, { type: "grammarRule", rule: "expression" })) {
        throw new JackCompilerError({ caller, message: `right hand side expression not found` });
      }

      // TODO: handle let var[expression] = expression
      throw new JackCompilerError({ caller, message: `array index assignment not implemented` });
    }

    const { segment, index } = this.#getVariableInfo(varNameNode.value.token);
    return [...this.#compileExpression(firstExpression), `pop ${segment} ${index}`];
  }

  // TODO: compile if statement (NEXT)
  #compileIfStatement(ifStatementNode: JackParseTreeNode): VmInstruction[] {
    const caller = this.#compileIfStatement.name;
    throw new JackCompilerError({ caller, message: `not implemented` });
  }

  #compileWhileStatement(whileStatementNode: JackParseTreeNode): VmInstruction[] {
    const caller = this.#compileWhileStatement.name;

    const whileExpressionNode = whileStatementNode.children.find(({ value }) =>
      isNode(value, { type: "grammarRule", rule: "expression" })
    );
    const whileStatementsNode = whileStatementNode.children.find(({ value }) =>
      isNode(value, { type: "grammarRule", rule: "statements" })
    );

    if (!whileExpressionNode) {
      throw new JackCompilerError({ caller, message: `while expression not found` });
    }
    if (!whileStatementsNode) {
      throw new JackCompilerError({ caller, message: `while statements not found` });
    }

    const startLabel = `while_${this.#classContext.whileCount++}`;
    const endLabel = `${startLabel}_end`;

    const epressionVmInstructions = this.#compileExpression(whileExpressionNode);
    const statementVmInstructions = this.#compileStatements(whileStatementsNode);

    return [
      `label ${startLabel}`,
      ...epressionVmInstructions,
      "not",
      `if-goto ${endLabel}`,
      ...statementVmInstructions,
      `goto ${startLabel}`,
      `label ${endLabel}`,
    ];
  }

  #compileDoStatement(doStatementNode: JackParseTreeNode): VmInstruction[] {
    const [doNode, ...subroutineCall] = doStatementNode.children;
    return [...this.#compileSubroutineCall(subroutineCall), "pop temp 0"];
  }

  #compileReturnStatement(returnStatementNode: JackParseTreeNode): VmInstruction[] {
    const caller = this.#compileReturnStatement.name;

    const vmInstructions: VmInstruction[] = [];

    const returnExpression = returnStatementNode.children.find(({ value }) =>
      isNode(value, { type: "grammarRule", rule: "expression" })
    );

    if (!returnExpression) {
      vmInstructions.push("push constant 0");
    } else {
      throw new JackCompilerError({ caller, message: `return statement expression not implemented` });
    }

    vmInstructions.push("return");

    return vmInstructions;
  }

  #compileExpression(expressionNode: JackParseTreeNode): VmInstruction[] {
    const caller = this.#compileExpression.name;

    const [firstTermNode, ...restExpression] = expressionNode.children;

    if (!firstTermNode || !isNode(firstTermNode.value, { type: "grammarRule", rule: "term" })) {
      throw new JackCompilerError({ caller, message: `invalid first term node, type: ${firstTermNode?.value.type}` });
    }

    const vmInstructions: VmInstruction[] = this.#compileTerm(firstTermNode);

    let currentNodeIndex = 0;
    while (currentNodeIndex < restExpression.length) {
      const operatorNode = restExpression[currentNodeIndex];
      currentNodeIndex++;

      const termNode = restExpression[currentNodeIndex];
      currentNodeIndex++;

      if (!operatorNode || !isOperator(operatorNode.value)) {
        throw new JackCompilerError({
          caller,
          message: `expected operator symbol node but was type ${operatorNode?.value.type}`,
        });
      }
      if (!termNode || !isNode(termNode.value, { type: "grammarRule", rule: "term" })) {
        throw new JackCompilerError({ caller, message: `invalid term node, type: ${termNode?.value.type}` });
      }

      vmInstructions.push(...this.#compileTerm(termNode));
      vmInstructions.push(this.#compileOperator(operatorNode.value.token));
    }

    return vmInstructions;
  }

  #compileTerm(termNode: JackParseTreeNode): VmInstruction[] {
    const caller = this.#compileTerm.name;

    const [first] = termNode.children;

    if (!first) {
      throw new JackCompilerError({ caller, message: `first term is undefined` });
    }

    switch (true) {
      case first.value.type === "integerConstant":
        return this.#compileIntegerConstantTerm(first.value);
      case first.value.type === "stringConstant":
        return this.#compileStringConstantTerm(first.value);
      case isKeywordConstant(first.value):
        return this.#compileKeywordConstantTerm(first.value);
      case isNode(first.value, { type: "symbol", token: "(" }):
        return this.#compileExpressionTerm(termNode);
      case first.value.type === "identifier":
        return this.#compileIdentifierTerm(termNode);
      default:
        return this.#compileUnaryOperatorTerm(termNode);
    }
  }

  #compileIntegerConstantTerm(integerConstant: IntegerConstantToken): VmInstruction[] {
    return [`push constant ${integerConstant.token}`];
  }

  // TODO: stringConstant
  #compileStringConstantTerm(stringConstant: StringConstantToken): VmInstruction[] {
    throw new JackCompilerError({ caller: this.#compileStringConstantTerm.name, message: `not implemented` });
  }

  #compileKeywordConstantTerm(keywordConstant: KeywordConstantToken): VmInstruction[] {
    switch (keywordConstant.token) {
      case "this":
        return ["push pointer 0"];
      case "true":
        return ["push constant 1", "neg"];
      case "false":
      case "null":
        return ["push constant 0"];
    }
  }

  #compileExpressionTerm(termNode: JackParseTreeNode): VmInstruction[] {
    const caller = this.#compileExpressionTerm.name;

    const expressionNode = termNode.children.find(({ value }) =>
      isNode(value, { type: "grammarRule", rule: "expression" })
    );

    if (!expressionNode) {
      throw new JackCompilerError({ caller, message: `did not find expression node when compiling "(expression)"` });
    }

    return this.#compileExpression(expressionNode);
  }

  #compileUnaryOperatorTerm(termNode: JackParseTreeNode): VmInstruction[] {
    const caller = this.#compileUnaryOperatorTerm.name;

    const [unaryOperator, term] = termNode.children;

    if (!unaryOperator || !isUnaryOperator(unaryOperator.value)) {
      throw new JackCompilerError({ caller, message: `did not find unary operator` });
    }

    if (!term || !isNode(term.value, { type: "grammarRule", rule: "term" })) {
      throw new JackCompilerError({ caller, message: `did not find term following unary operator` });
    }

    return [...this.#compileTerm(term), this.#compileUnaryOperator(unaryOperator.value.token)];
  }

  #compileIdentifierTerm(termNode: JackParseTreeNode): VmInstruction[] {
    const caller = this.#compileIdentifierTerm.name;

    const [first, second] = termNode.children;

    if (!first || first.value.type !== "identifier") {
      throw new JackCompilerError({ caller, message: `first node in term was not an identifier` });
    }

    if (!second) {
      const { segment, index } = this.#getVariableInfo(first.value.token);
      return [`push ${segment} ${index}`];
    }

    if (
      !isNode(second.value, [
        { type: "symbol", token: "[" },
        { type: "symbol", token: "." },
        { type: "symbol", token: "(" },
      ])
    ) {
      throw new JackCompilerError({ caller, message: `unexpected node following identifier, ${second.value.type}` });
    }

    switch (second.value.token) {
      case "[":
        throw new JackCompilerError({ caller, message: `varName[exp] term not implemented` });
      case "(":
      case ".":
        return this.#compileSubroutineCall(termNode.children);
    }
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
    const caller = this.#compileSubroutineCall.name;

    const expressionListNode = subroutineCallNodes.find(({ value }) =>
      isNode(value, { type: "grammarRule", rule: "expressionList" })
    );

    if (!expressionListNode) {
      throw new JackCompilerError({ caller, message: `no expression list found` });
    }

    const vmInstructions: VmInstruction[] = [];

    if (!subroutineCallNodes.some(({ value }) => isNode(value, { type: "symbol", token: "." }))) {
      // TODO: compile method() calls (this.method())
      throw new JackCompilerError({ caller, message: `this.method() calls not implemented` });
    }

    const [classOrVarNameNode, _, subroutineNameNode] = subroutineCallNodes;

    if (!classOrVarNameNode || classOrVarNameNode.value.type !== "identifier") {
      throw new JackCompilerError({ caller, message: `invalid class or var name node` });
    }
    if (!subroutineNameNode || subroutineNameNode.value.type !== "identifier") {
      throw new JackCompilerError({ caller, message: `invalid subroutine name node` });
    }

    if (this.#subroutineContext.symbolTable.has(classOrVarNameNode.value.token)) {
      // TODO: compile variable.method() calls
      throw new JackCompilerError({ caller, message: `variable.method() calls not implemented` });
    } else {
      // TODO: pull this up to use for methods as well?
      vmInstructions.push(...this.#compileExpressionList(expressionListNode));
      vmInstructions.push(
        `call ${classOrVarNameNode.value.token}.${subroutineNameNode.value.token} ${expressionListNode.children.length}`
      );
    }

    return vmInstructions;
  }

  #compileExpressionList(expressionListNode: JackParseTreeNode): VmInstruction[] {
    return expressionListNode.children
      .filter(({ value }) => isNode(value, { type: "grammarRule", rule: "expression" }))
      .flatMap((expressionNode) => this.#compileExpression(expressionNode));
  }
}

export default JackCompiler;
