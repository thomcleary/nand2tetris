import { assemble } from "../../../06/src/assembler.js";
import type { AssemblyInstruction } from "../../../07-08/src/types.js";
import { translate } from "../../../07-08/src/vmTranslator.js";
import JackParseTree, { JackParseTreeNode } from "../parser/JackParseTree.js";
import JackParser from "../parser/JackParser.js";
import tokenize from "../tokenizer/index.js";
import type {
  IntegerConstantToken,
  KeywordConstantToken,
  Operator,
  StringConstantToken,
  Token,
  UnaryOperator,
} from "../types/Token.js";
import type { VmInstruction } from "../types/VmInstruction.js";
import type { Result } from "../types/index.js";
import { toJackProgram } from "../utils/index.js";
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
import SymbolTable, { type ClassSymbolKind, type SubroutineSymbolKind } from "./SymbolTable.js";

type ClassContext = {
  readonly symbolTable: SymbolTable<ClassSymbolKind>;
  className: string;
  ifCount: number;
  whileCount: number;
};

type SubroutineContext = {
  readonly symbolTable: SymbolTable<SubroutineSymbolKind>;
};

export type CompilationResult = Readonly<{
  tokens: readonly Token[];
  jackParseTree: JackParseTree;
  vmInstructions: readonly VmInstruction[];
  assemblyInstructions: readonly AssemblyInstruction[];
  hackInstructions: readonly string[];
}>;

export class JackCompiler {
  #jackParser = new JackParser();
  #classContext: ClassContext = { symbolTable: new SymbolTable(), className: "", ifCount: 0, whileCount: 0 };
  #subroutineContext: SubroutineContext = { symbolTable: new SymbolTable() };

  #getVariableInfo({ name }: { name: string }) {
    return this.#subroutineContext.symbolTable.get(name) ?? this.#classContext.symbolTable.get(name);
  }

  #resetSubroutineContext() {
    this.#subroutineContext = { symbolTable: new SymbolTable() };
  }

  #reset() {
    this.#classContext = { symbolTable: new SymbolTable(), className: "", ifCount: 0, whileCount: 0 };
    this.#resetSubroutineContext();
  }

  compile({ jackFileContents }: { jackFileContents: string }): Result<CompilationResult, Partial<CompilationResult>> {
    const jackProgram = toJackProgram(jackFileContents);

    const tokenizeResult = tokenize(jackProgram);

    if (!tokenizeResult.success) {
      return tokenizeResult;
    }

    const { tokens } = tokenizeResult;

    const parseResult = this.#jackParser.parse(tokens);

    if (!parseResult.success) {
      return { ...parseResult, tokens };
    }

    const { jackParseTree } = parseResult;

    try {
      this.#reset();
      const vmInstructions = this.#compile({ jackParseTree });
      const assemblyInstructionsResult = translate({ vmInstructions, fileName: this.#classContext.className });

      if (!assemblyInstructionsResult.success) {
        return { ...assemblyInstructionsResult, tokens, jackParseTree, vmInstructions };
      }

      const { assemblyInstructions } = assemblyInstructionsResult;
      const hackInstructionsResult = assemble({ assemblyInstructions });

      if (!hackInstructionsResult.success) {
        return { ...hackInstructionsResult, tokens, jackParseTree, vmInstructions, assemblyInstructions };
      }

      const { hackInstructions } = hackInstructionsResult;

      return {
        success: true,
        tokens,
        jackParseTree,
        vmInstructions: this.#compile({ jackParseTree }),
        assemblyInstructions,
        hackInstructions,
      };
    } catch (e) {
      return {
        success: false,
        tokens,
        jackParseTree,
        message: e instanceof Error ? e.message : "Compilation failed (no error provided)",
      };
    }
  }

  #compile({ jackParseTree }: { jackParseTree: JackParseTree }): readonly VmInstruction[] {
    const caller = this.#compile.name;

    const classNode = jackParseTree.root;

    if (!isNode(classNode.value, { type: "grammarRule", rule: "class" })) {
      throw new JackCompilerError({ caller, message: `expected class node but was ${classNode.value}` });
    }

    const [classKeywordNode, classNameNode] = classNode.children;

    if (!classNameNode || classNameNode.value.type !== "identifier") {
      throw new JackCompilerError({ caller, message: `expected class name node but was ${classNameNode?.value}` });
    }

    this.#classContext.className = classNameNode.value.token;

    classNode.children
      .filter(({ value }) => isNode(value, { type: "grammarRule", rule: "classVarDec" }))
      .forEach((classVarDecNode) => this.#compileClassVarDec({ classVarDecNode }));

    const vmInstructions = classNode.children
      .filter(({ value }) => isNode(value, { type: "grammarRule", rule: "subroutineDec" }))
      .flatMap((subroutineDecNode) => this.#compileSubroutineDec({ subroutineDecNode }));

    return vmInstructions;
  }

  #compileClassVarDec({ classVarDecNode }: { classVarDecNode: JackParseTreeNode }): void {
    const caller = this.#compileClassVarDec.name;

    const [kindNode, typeNode] = classVarDecNode.children;

    if (!kindNode || !isClassVarKeyword(kindNode.value)) {
      throw new JackCompilerError({ caller, message: `expected static/field but was ${kindNode?.value}` });
    }
    if (!typeNode || !isType(typeNode.value)) {
      throw new JackCompilerError({ caller, message: `expected type token but was ${typeNode?.value}` });
    }

    const kind = kindNode.value.token;
    const type = typeNode.value.token;

    classVarDecNode.children
      .slice(2)
      .map((node) => node.value)
      .filter((token) => token.type === "identifier")
      .forEach((identifier) => this.#classContext.symbolTable.add({ name: identifier.token, kind, type }));
  }

  #compileSubroutineDec({ subroutineDecNode }: { subroutineDecNode: JackParseTreeNode }): readonly VmInstruction[] {
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

  #compileSubroutineBody({ subroutineBodyNode }: { subroutineBodyNode: JackParseTreeNode }): readonly VmInstruction[] {
    const caller = this.#compileSubroutineBody.name;

    const statementsNode = subroutineBodyNode.children.find(({ value }) =>
      isNode(value, { type: "grammarRule", rule: "statements" })
    );

    if (!statementsNode) {
      throw new JackCompilerError({ caller, message: `statements node not found` });
    }

    return this.#compileStatements({ statementsNode });
  }

  #compileStatements({ statementsNode }: { statementsNode: JackParseTreeNode }): readonly VmInstruction[] {
    return statementsNode.children.flatMap((statementNode) => this.#compileStatement(statementNode));
  }

  #compileStatement(statementNode: JackParseTreeNode): readonly VmInstruction[] {
    const caller = this.#compileStatement.name;

    if (!isStatementRule(statementNode.value)) {
      throw new JackCompilerError({ caller, message: `expected statement node but was ${statementNode.value.type}` });
    }

    switch (statementNode.value.rule) {
      case "letStatement":
        return this.#compileLetStatement({ letStatementNode: statementNode });
      case "ifStatement":
        return this.#compileIfStatement({ ifStatementNode: statementNode });
      case "whileStatement":
        return this.#compileWhileStatement({ whileStatementNode: statementNode });
      case "doStatement":
        return this.#compileDoStatement({ doStatementNode: statementNode });
      case "returnStatement":
        return this.#compileReturnStatement({ returnStatementNode: statementNode });
    }
  }

  #compileLetStatement({ letStatementNode }: { letStatementNode: JackParseTreeNode }): readonly VmInstruction[] {
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

    const variableInfo = this.#getVariableInfo({ name: varNameNode.value.token });

    if (!variableInfo) {
      throw new JackCompilerError({
        caller,
        message: "Variable on left hand side of let statement not found in symbol tables",
      });
    }

    if (arrayIndexOrSymbolNode.value.token === "[") {
      if (!secondExpression || !isNode(secondExpression.value, { type: "grammarRule", rule: "expression" })) {
        throw new JackCompilerError({ caller, message: `right hand side expression not found` });
      }

      return [
        `push ${variableInfo.segment} ${variableInfo.index}`,
        ...this.#compileExpression({ expressionNode: firstExpression }),
        "add",
        ...this.#compileExpression({ expressionNode: secondExpression }),
        "pop temp 0",
        "pop pointer 1",
        "push temp 0",
        "pop that 0",
      ];
    }

    return [
      ...this.#compileExpression({ expressionNode: firstExpression }),
      `pop ${variableInfo.segment} ${variableInfo.index}`,
    ];
  }

  #compileIfStatement({ ifStatementNode }: { ifStatementNode: JackParseTreeNode }): readonly VmInstruction[] {
    const caller = this.#compileIfStatement.name;

    const ifExpressionNode = ifStatementNode.children.find(({ value }) =>
      isNode(value, { type: "grammarRule", rule: "expression" })
    );

    const elseNode = ifStatementNode.children.find(({ value }) => isNode(value, { type: "keyword", token: "else" }));

    const [ifStatementsNode, elseStatementsNode] = ifStatementNode.children.filter(({ value }) =>
      isNode(value, { type: "grammarRule", rule: "statements" })
    );

    if (!ifExpressionNode) {
      throw new JackCompilerError({ caller, message: `if expression not found` });
    }
    if (!ifStatementsNode) {
      throw new JackCompilerError({ caller, message: `if statements not found` });
    }
    if (elseNode && !elseStatementsNode) {
      throw new JackCompilerError({ caller, message: `else statements not found` });
    }

    const labelPrefix = `IF_${this.#classContext.ifCount++}`;
    const elseLabel = `${labelPrefix}_ELSE`;
    const endLabel = `${labelPrefix}_END`;

    const expressionVmInstructions = this.#compileExpression({ expressionNode: ifExpressionNode });
    const ifVmInstructions = this.#compileStatements({ statementsNode: ifStatementsNode });
    const elseVmInstructions = elseStatementsNode
      ? this.#compileStatements({ statementsNode: elseStatementsNode })
      : [];

    return [
      ...expressionVmInstructions,
      "not",
      `if-goto ${elseLabel}`,
      ...ifVmInstructions,
      `goto ${endLabel}`,
      `label ${elseLabel}`,
      ...elseVmInstructions,
      `label ${endLabel}`,
    ];
  }

  #compileWhileStatement({ whileStatementNode }: { whileStatementNode: JackParseTreeNode }): readonly VmInstruction[] {
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

    const startLabel = `WHILE_${this.#classContext.whileCount++}`;
    const endLabel = `${startLabel}_END`;

    const expressionVmInstructions = this.#compileExpression({ expressionNode: whileExpressionNode });
    const statementVmInstructions = this.#compileStatements({ statementsNode: whileStatementsNode });

    return [
      `label ${startLabel}`,
      ...expressionVmInstructions,
      "not",
      `if-goto ${endLabel}`,
      ...statementVmInstructions,
      `goto ${startLabel}`,
      `label ${endLabel}`,
    ];
  }

  #compileDoStatement({ doStatementNode }: { doStatementNode: JackParseTreeNode }): readonly VmInstruction[] {
    const [doNode, ...subroutineCallNodes] = doStatementNode.children;
    return [...this.#compileSubroutineCall({ subroutineCallNodes }), "pop temp 0"];
  }

  #compileReturnStatement({
    returnStatementNode,
  }: {
    returnStatementNode: JackParseTreeNode;
  }): readonly VmInstruction[] {
    const vmInstructions: VmInstruction[] = [];

    const returnExpression = returnStatementNode.children.find(({ value }) =>
      isNode(value, { type: "grammarRule", rule: "expression" })
    );

    if (!returnExpression) {
      vmInstructions.push("push constant 0");
    } else {
      vmInstructions.push(...this.#compileExpression({ expressionNode: returnExpression }));
    }

    vmInstructions.push("return");

    return vmInstructions;
  }

  #compileExpression({ expressionNode }: { expressionNode: JackParseTreeNode }): readonly VmInstruction[] {
    const caller = this.#compileExpression.name;

    const [firstTermNode, ...restExpression] = expressionNode.children;

    if (!firstTermNode || !isNode(firstTermNode.value, { type: "grammarRule", rule: "term" })) {
      throw new JackCompilerError({ caller, message: `invalid first term node, type: ${firstTermNode?.value.type}` });
    }

    const vmInstructions = [...this.#compileTerm({ termNode: firstTermNode })];

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

      vmInstructions.push(...this.#compileTerm({ termNode }));
      vmInstructions.push(this.#compileOperator({ operator: operatorNode.value.token }));
    }

    return vmInstructions;
  }

  #compileTerm({ termNode }: { termNode: JackParseTreeNode }): readonly VmInstruction[] {
    const caller = this.#compileTerm.name;

    const [first] = termNode.children;

    if (!first) {
      throw new JackCompilerError({ caller, message: `first term is undefined` });
    }

    switch (true) {
      case first.value.type === "integerConstant":
        return this.#compileIntegerConstantTerm({ integerConstantToken: first.value });
      case first.value.type === "stringConstant":
        return this.#compileStringConstantTerm({ stringConstantToken: first.value });
      case isKeywordConstant(first.value):
        return this.#compileKeywordConstantTerm({ keywordConstantToken: first.value });
      case isNode(first.value, { type: "symbol", token: "(" }):
        return this.#compileExpressionTerm({ termNode });
      case first.value.type === "identifier":
        return this.#compileIdentifierTerm({ termNode });
      default:
        return this.#compileUnaryOperatorTerm({ termNode });
    }
  }

  #compileIntegerConstantTerm({
    integerConstantToken,
  }: {
    integerConstantToken: IntegerConstantToken;
  }): readonly VmInstruction[] {
    return [`push constant ${integerConstantToken.token}`];
  }

  #compileStringConstantTerm({
    stringConstantToken: { token },
  }: {
    stringConstantToken: StringConstantToken;
  }): readonly VmInstruction[] {
    return [
      `push constant ${token.length}`,
      "call String.new 1",
      ...token.split("").flatMap((char): readonly VmInstruction[] => {
        const charCode = char.charCodeAt(0);

        if (isNaN(charCode)) {
          throw new JackCompilerError({
            caller: this.#compileStringConstantTerm.name,
            message: `char code of character [${char}] is NaN`,
          });
        }

        return [`push constant ${charCode}`, "call String.appendChar 2"];
      }),
    ];
  }

  #compileKeywordConstantTerm({
    keywordConstantToken,
  }: {
    keywordConstantToken: KeywordConstantToken;
  }): readonly VmInstruction[] {
    switch (keywordConstantToken.token) {
      case "this":
        return ["push pointer 0"];
      case "true":
        return ["push constant 1", "neg"];
      case "false":
      case "null":
        return ["push constant 0"];
    }
  }

  #compileExpressionTerm({ termNode }: { termNode: JackParseTreeNode }): readonly VmInstruction[] {
    const caller = this.#compileExpressionTerm.name;

    const expressionNode = termNode.children.find(({ value }) =>
      isNode(value, { type: "grammarRule", rule: "expression" })
    );

    if (!expressionNode) {
      throw new JackCompilerError({ caller, message: `did not find expression node when compiling "(expression)"` });
    }

    return this.#compileExpression({ expressionNode });
  }

  #compileIdentifierTerm({ termNode }: { termNode: JackParseTreeNode }): readonly VmInstruction[] {
    const caller = this.#compileIdentifierTerm.name;

    const [first, second] = termNode.children;

    if (!first || first.value.type !== "identifier") {
      throw new JackCompilerError({ caller, message: `first node in term was not an identifier` });
    }

    if (!second) {
      const variableInfo = this.#getVariableInfo({ name: first.value.token });

      if (!variableInfo) {
        throw new JackCompilerError({ caller, message: "Variable not found in symbol tables" });
      }

      return [`push ${variableInfo.segment} ${variableInfo.index}`];
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
        return this.#compileArrayIndexExpression({ arrayIndexExpressionNodes: termNode.children });
      case "(":
      case ".":
        return this.#compileSubroutineCall({ subroutineCallNodes: termNode.children });
    }
  }

  #compileUnaryOperatorTerm({ termNode }: { termNode: JackParseTreeNode }): readonly VmInstruction[] {
    const caller = this.#compileUnaryOperatorTerm.name;

    const [unaryOperator, term] = termNode.children;

    if (!unaryOperator || !isUnaryOperator(unaryOperator.value)) {
      throw new JackCompilerError({ caller, message: `did not find unary operator` });
    }

    if (!term || !isNode(term.value, { type: "grammarRule", rule: "term" })) {
      throw new JackCompilerError({ caller, message: `did not find term following unary operator` });
    }

    return [
      ...this.#compileTerm({ termNode: term }),
      this.#compileUnaryOperator({ operator: unaryOperator.value.token }),
    ];
  }

  #compileOperator({ operator }: { operator: Operator }): VmInstruction {
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

  #compileUnaryOperator({ operator }: { operator: UnaryOperator }): VmInstruction {
    switch (operator) {
      case "-":
        return "neg";
      case "~":
        return "not";
    }
  }

  #compileArrayIndexExpression({
    arrayIndexExpressionNodes,
  }: {
    arrayIndexExpressionNodes: JackParseTreeNode[];
  }): readonly VmInstruction[] {
    const caller = this.#compileArrayIndexExpression.name;

    const varNameNode = arrayIndexExpressionNodes.find(({ value }) => value.type === "identifier");
    const expressionNode = arrayIndexExpressionNodes.find(({ value }) =>
      isNode(value, { type: "grammarRule", rule: "expression" })
    );

    if (!varNameNode || varNameNode.value.type !== "identifier") {
      throw new JackCompilerError({ caller, message: `no var name node found` });
    }
    if (!expressionNode) {
      throw new JackCompilerError({ caller, message: `no expression node found` });
    }

    const variableInfo = this.#getVariableInfo({ name: varNameNode.value.token });

    if (!variableInfo) {
      throw new JackCompilerError({
        caller,
        message: "array variable not found in symbol tables",
      });
    }

    return [
      `push ${variableInfo.segment} ${variableInfo.index}`,
      ...this.#compileExpression({ expressionNode }),
      "add",
      "pop pointer 1",
      "push that 0",
    ];
  }

  #compileSubroutineCall({
    subroutineCallNodes,
  }: {
    subroutineCallNodes: JackParseTreeNode[];
  }): readonly VmInstruction[] {
    const caller = this.#compileSubroutineCall.name;

    const expressionListNode = subroutineCallNodes.find(({ value }) =>
      isNode(value, { type: "grammarRule", rule: "expressionList" })
    );

    if (!expressionListNode) {
      throw new JackCompilerError({ caller, message: `no expression list found` });
    }

    const argumentCount = expressionListNode.children.filter(({ value }) =>
      isNode(value, { type: "grammarRule", rule: "expression" })
    ).length;

    const argumentInstructions = [...this.#compileExpressionList({ expressionListNode })];

    if (!subroutineCallNodes.some(({ value }) => isNode(value, { type: "symbol", token: "." }))) {
      const [subroutineNameNode] = subroutineCallNodes;

      if (!subroutineNameNode || subroutineNameNode.value.type !== "identifier") {
        throw new JackCompilerError({ caller, message: `invalid subroutine name node` });
      }

      return [
        `push pointer 0`,
        ...argumentInstructions,
        `call ${this.#classContext.className}.${subroutineNameNode.value.token} ${argumentCount + 1}`,
      ];
    }

    const [classOrVarNameNode, _, subroutineNameNode] = subroutineCallNodes;

    if (!classOrVarNameNode || classOrVarNameNode.value.type !== "identifier") {
      throw new JackCompilerError({ caller, message: `invalid class or var name node` });
    }
    if (!subroutineNameNode || subroutineNameNode.value.type !== "identifier") {
      throw new JackCompilerError({ caller, message: `invalid subroutine name node` });
    }

    const variableInfo = this.#getVariableInfo({ name: classOrVarNameNode.value.token });

    if (variableInfo) {
      return [
        `push ${variableInfo.segment} ${variableInfo.index}`,
        ...argumentInstructions,
        `call ${variableInfo.type}.${subroutineNameNode.value.token} ${argumentCount + 1}`,
      ];
    }

    return [
      ...argumentInstructions,
      `call ${classOrVarNameNode.value.token}.${subroutineNameNode.value.token} ${argumentCount}`,
    ];
  }

  #compileExpressionList({ expressionListNode }: { expressionListNode: JackParseTreeNode }): readonly VmInstruction[] {
    return expressionListNode.children
      .filter(({ value }) => isNode(value, { type: "grammarRule", rule: "expression" }))
      .flatMap((expressionNode) => this.#compileExpression({ expressionNode }));
  }
}

export default JackCompiler;
