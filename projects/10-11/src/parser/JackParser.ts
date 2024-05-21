import { KeywordToken, SymbolToken, Token } from "../tokenizer/types.js";
import { Result } from "../types.js";
import { error } from "../utils/index.js";
import JackParseTree, { JackParseTreeNode } from "./JackParseTree.js";
import JackParserError from "./JackParserError.js";
import {
  isClassVarKeywordToken,
  isKeywordConstantToken,
  isOperatorToken,
  isSeparatorToken,
  isStatementToken,
  isSubroutineTypeToken,
  isTypeToken,
  isUnaryOperatorToken,
} from "./utils.js";

export class JackParser {
  #tokens: readonly Token[] = [];
  #currentTokenIndex = 0;

  get #currentToken() {
    const token = this.#tokens[this.#currentTokenIndex];

    if (!token) {
      throw new RangeError("[currentToken] currentTokenIndex out of range for tokens");
    }

    return token;
  }

  constructor() {}

  parse(tokens: readonly Token[]): Result<{ jackParseTree: JackParseTree }> {
    this.#tokens = tokens;
    this.#reset();

    try {
      return { success: true, jackParseTree: this.#parseClass() };
    } catch (e) {
      return { success: false, message: error(e instanceof Error ? e.message : "Failed to parse tokens") };
    }
  }

  #reset() {
    this.#currentTokenIndex = 0;
  }

  #advanceToken() {
    this.#currentTokenIndex++;
  }

  #lookAhead(): Token {
    const token = this.#tokens[this.#currentTokenIndex + 1];

    if (!token) {
      throw new RangeError("[lookAhead] (currentTokenIndex + 1) out of range for tokens");
    }

    return token;
  }

  #insertToken({
    node,
    isExpected,
    expected,
    caller,
  }:
    | {
        node: JackParseTreeNode;
        isExpected?: never;
        expected: KeywordToken | SymbolToken | Omit<Exclude<Token, KeywordToken | SymbolToken>, "token">;
        caller: { name: string };
      }
    | {
        node: JackParseTreeNode;
        isExpected: (token: Token) => boolean;
        expected: { type: string; token?: string };
        caller: { name: string };
      }) {
    const token = this.#currentToken;

    if (isExpected) {
      if (!isExpected(token)) {
        throw new JackParserError({ caller: caller.name, expected, actual: token });
      }
    } else {
      const typeMatch = expected.type === token.type;
      const expectingKeywordOrSymbol = expected.type === "keyword" || expected.type === "symbol";
      const tokenMatch = expectingKeywordOrSymbol && token.token === expected.token;

      if (!typeMatch || (expectingKeywordOrSymbol && !tokenMatch)) {
        throw new JackParserError({ caller: caller.name, expected, actual: token });
      }
    }

    node.insert(token);
    this.#advanceToken();
  }

  #parseClass(): JackParseTree {
    const caller = this.#parseClass;

    const parseTree = new JackParseTree({ type: "grammarRule", rule: "class" });
    const classNode = parseTree.root;

    this.#insertToken({ node: classNode, expected: { type: "keyword", token: "class" }, caller });
    this.#insertToken({ node: classNode, expected: { type: "identifier" }, caller });
    this.#insertToken({ node: classNode, expected: { type: "symbol", token: "{" }, caller });
    this.#parseClassVarDecs().forEach((node) => classNode.insert(node));
    this.#parseSubroutineDecs().forEach((node) => classNode.insert(node));
    this.#insertToken({ node: classNode, expected: { type: "symbol", token: "}" }, caller });

    return parseTree;
  }

  #parseClassVarDecs(): JackParseTreeNode[] {
    const caller = this.#parseClassVarDecs;
    const classVarDecNodes: JackParseTreeNode[] = [];

    let classVarKeywordToken = this.#currentToken;
    while (isClassVarKeywordToken(classVarKeywordToken)) {
      const classVarDecNode = new JackParseTreeNode({ type: "grammarRule", rule: "classVarDec" });

      classVarDecNode.insert(classVarKeywordToken);
      this.#advanceToken();

      this.#insertToken({
        node: classVarDecNode,
        expected: { type: "keyword/identifier", token: "(int|char|boolean)/_<identifier>" },
        isExpected: isTypeToken,
        caller,
      });
      this.#insertToken({ node: classVarDecNode, expected: { type: "identifier" }, caller });

      let varDecSeparatorToken = this.#currentToken;
      while (isSeparatorToken(varDecSeparatorToken)) {
        classVarDecNode.insert(varDecSeparatorToken);
        this.#advanceToken();

        this.#insertToken({ node: classVarDecNode, expected: { type: "identifier" }, caller });

        varDecSeparatorToken = this.#currentToken;
      }

      this.#insertToken({ node: classVarDecNode, expected: { type: "symbol", token: ";" }, caller });

      classVarDecNodes.push(classVarDecNode);
      classVarKeywordToken = this.#currentToken;
    }

    return classVarDecNodes;
  }

  #parseSubroutineDecs(): JackParseTreeNode[] {
    const caller = this.#parseSubroutineDecs;
    const subroutineDecNodes: JackParseTreeNode[] = [];

    let subroutineTypeToken = this.#currentToken;
    while (isSubroutineTypeToken(subroutineTypeToken)) {
      const subroutineDecNode = new JackParseTreeNode({ type: "grammarRule", rule: "subroutineDec" });
      subroutineDecNode.insert(subroutineTypeToken);
      this.#advanceToken();

      this.#insertToken({
        node: subroutineDecNode,
        expected: { type: "type/void", token: "(int|char|boolean)/_<identifier>/void" },
        isExpected: (token) => isTypeToken(token) || (token.type === "keyword" && token.token === "void"),
        caller,
      });
      this.#insertToken({ node: subroutineDecNode, expected: { type: "identifier" }, caller });
      this.#insertToken({ node: subroutineDecNode, expected: { type: "symbol", token: "(" }, caller });
      subroutineDecNode.insert(this.#parseParameterList());
      this.#insertToken({ node: subroutineDecNode, expected: { type: "symbol", token: ")" }, caller });
      subroutineDecNode.insert(this.#parseSubroutineBody());

      subroutineDecNodes.push(subroutineDecNode);
      subroutineTypeToken = this.#currentToken;
    }

    return subroutineDecNodes;
  }

  #parseParameterList(): JackParseTreeNode {
    const caller = this.#parseParameterList;
    const parameterListNode = new JackParseTreeNode({ type: "grammarRule", rule: "parameterList" });

    const parameterTypeToken = this.#currentToken;
    if (!isTypeToken(parameterTypeToken)) {
      return parameterListNode;
    }
    parameterListNode.insert(parameterTypeToken);
    this.#advanceToken();

    this.#insertToken({ node: parameterListNode, expected: { type: "identifier" }, caller });

    let parameterSeparatorToken = this.#currentToken;
    while (isSeparatorToken(parameterSeparatorToken)) {
      parameterListNode.insert(parameterSeparatorToken);
      this.#advanceToken();

      this.#insertToken({
        node: parameterListNode,
        expected: { type: "keyword/identifier", token: "(int|char|boolean)/_<identifier>" },
        isExpected: isTypeToken,
        caller,
      });
      this.#insertToken({ node: parameterListNode, expected: { type: "identifier" }, caller });

      parameterSeparatorToken = this.#currentToken;
    }

    return parameterListNode;
  }

  #parseSubroutineBody(): JackParseTreeNode {
    const caller = this.#parseSubroutineBody;
    const subroutineBodyNode = new JackParseTreeNode({ type: "grammarRule", rule: "subroutineBody" });

    this.#insertToken({ node: subroutineBodyNode, expected: { type: "symbol", token: "{" }, caller });
    this.#parseVarDecs().forEach((node) => subroutineBodyNode.insert(node));
    subroutineBodyNode.insert(this.#parseStatements());
    this.#insertToken({ node: subroutineBodyNode, expected: { type: "symbol", token: "}" }, caller });

    return subroutineBodyNode;
  }

  #parseVarDecs(): JackParseTreeNode[] {
    const caller = this.#parseVarDecs;
    const varDecNodes: JackParseTreeNode[] = [];

    let varToken = this.#currentToken;
    while (varToken.type === "keyword" && varToken.token === "var") {
      const varDecNode = new JackParseTreeNode({ type: "grammarRule", rule: "varDec" });
      varDecNode.insert(varToken);
      this.#advanceToken();

      this.#insertToken({
        node: varDecNode,
        expected: { type: "keyword/identifier", token: "(int|char|boolean)/_<identifier>" },
        isExpected: isTypeToken,
        caller,
      });
      this.#insertToken({ node: varDecNode, expected: { type: "identifier" }, caller });

      let varDecSeparatorToken = this.#currentToken;
      while (isSeparatorToken(varDecSeparatorToken)) {
        varDecNode.insert(varDecSeparatorToken);
        this.#advanceToken();

        this.#insertToken({ node: varDecNode, expected: { type: "identifier" }, caller });

        varDecSeparatorToken = this.#currentToken;
      }

      this.#insertToken({ node: varDecNode, expected: { type: "symbol", token: ";" }, caller });

      varDecNodes.push(varDecNode);
      varToken = this.#currentToken;
    }

    return varDecNodes;
  }

  #parseStatements(): JackParseTreeNode {
    const statementsNode = new JackParseTreeNode({ type: "grammarRule", rule: "statements" });

    const statementMap = {
      let: this.#parseLetStatement,
      if: this.#parseIfStatement,
      while: this.#parseWhileStatement,
      do: this.#parseDoStatement,
      return: this.#parseReturnStatement,
    } as const;

    let statementToken = this.#currentToken;
    while (isStatementToken(statementToken)) {
      statementsNode.insert(statementMap[statementToken.token].bind(this)());

      statementToken = this.#currentToken;
    }

    return statementsNode;
  }

  #parseLetStatement(): JackParseTreeNode {
    const caller = this.#parseLetStatement;
    const letStatementNode = new JackParseTreeNode({ type: "grammarRule", rule: "letStatement" });

    this.#insertToken({ node: letStatementNode, expected: { type: "keyword", token: "let" }, caller });
    this.#insertToken({ node: letStatementNode, expected: { type: "identifier" }, caller });
    this.#parseArrayIndexing({ node: letStatementNode });
    this.#insertToken({ node: letStatementNode, expected: { type: "symbol", token: "=" }, caller });
    letStatementNode.insert(this.#parseExpression());
    this.#insertToken({ node: letStatementNode, expected: { type: "symbol", token: ";" }, caller });

    return letStatementNode;
  }

  #parseIfStatement(): JackParseTreeNode {
    const caller = this.#parseIfStatement;
    const ifStatementNode = new JackParseTreeNode({ type: "grammarRule", rule: "ifStatement" });

    this.#insertToken({ node: ifStatementNode, expected: { type: "keyword", token: "if" }, caller });
    this.#insertToken({ node: ifStatementNode, expected: { type: "symbol", token: "(" }, caller });
    ifStatementNode.insert(this.#parseExpression());
    this.#insertToken({ node: ifStatementNode, expected: { type: "symbol", token: ")" }, caller });
    this.#insertToken({ node: ifStatementNode, expected: { type: "symbol", token: "{" }, caller });
    ifStatementNode.insert(this.#parseStatements());
    this.#insertToken({ node: ifStatementNode, expected: { type: "symbol", token: "}" }, caller });

    const elseToken = this.#currentToken;
    if (elseToken.type === "keyword" && elseToken.token === "else") {
      ifStatementNode.insert(elseToken);
      this.#advanceToken();

      this.#insertToken({ node: ifStatementNode, expected: { type: "symbol", token: "{" }, caller });
      ifStatementNode.insert(this.#parseStatements());
      this.#insertToken({ node: ifStatementNode, expected: { type: "symbol", token: "}" }, caller });
    }

    return ifStatementNode;
  }

  #parseWhileStatement(): JackParseTreeNode {
    const caller = this.#parseWhileStatement;
    const whileStatementNode = new JackParseTreeNode({ type: "grammarRule", rule: "whileStatement" });

    this.#insertToken({ node: whileStatementNode, expected: { type: "keyword", token: "while" }, caller });
    this.#insertToken({ node: whileStatementNode, expected: { type: "symbol", token: "(" }, caller });
    whileStatementNode.insert(this.#parseExpression());
    this.#insertToken({ node: whileStatementNode, expected: { type: "symbol", token: ")" }, caller });
    this.#insertToken({ node: whileStatementNode, expected: { type: "symbol", token: "{" }, caller });
    whileStatementNode.insert(this.#parseStatements());
    this.#insertToken({ node: whileStatementNode, expected: { type: "symbol", token: "}" }, caller });

    return whileStatementNode;
  }

  #parseDoStatement(): JackParseTreeNode {
    const caller = this.#parseDoStatement;
    const doStatementNode = new JackParseTreeNode({ type: "grammarRule", rule: "doStatement" });

    this.#insertToken({ node: doStatementNode, expected: { type: "keyword", token: "do" }, caller });
    this.#parseSubroutineCall({ node: doStatementNode });
    this.#insertToken({ node: doStatementNode, expected: { type: "symbol", token: ";" }, caller });

    return doStatementNode;
  }

  #parseReturnStatement(): JackParseTreeNode {
    const caller = this.#parseReturnStatement;
    const returnStatementNode = new JackParseTreeNode({ type: "grammarRule", rule: "returnStatement" });

    this.#insertToken({ node: returnStatementNode, expected: { type: "keyword", token: "return" }, caller });

    if (this.#currentToken.type !== "symbol" || this.#currentToken.token !== ";") {
      returnStatementNode.insert(this.#parseExpression());
    }

    this.#insertToken({ node: returnStatementNode, expected: { type: "symbol", token: ";" }, caller });

    return returnStatementNode;
  }

  #parseExpression(): JackParseTreeNode {
    const expressionNode = new JackParseTreeNode({ type: "grammarRule", rule: "expression" });

    expressionNode.insert(this.#parseTerm());

    let operatorToken = this.#currentToken;
    while (isOperatorToken(operatorToken)) {
      expressionNode.insert(operatorToken);
      this.#advanceToken();

      expressionNode.insert(this.#parseTerm());

      operatorToken = this.#currentToken;
    }

    return expressionNode;
  }

  #parseTerm(): JackParseTreeNode {
    const caller = this.#parseTerm;
    const termNode = new JackParseTreeNode({ type: "grammarRule", rule: "term" });

    const initialToken = this.#currentToken;

    if (
      initialToken.type === "integerConstant" ||
      initialToken.type === "stringConstant" ||
      isKeywordConstantToken(initialToken)
    ) {
      termNode.insert(initialToken);
      this.#advanceToken();
    } else if (initialToken.type === "identifier") {
      const lookAheadToken = this.#lookAhead();

      if (lookAheadToken.type === "symbol" && lookAheadToken.token === ".") {
        this.#parseSubroutineCall({ node: termNode });
      } else {
        termNode.insert(initialToken);
        this.#advanceToken();

        this.#parseArrayIndexing({ node: termNode });
      }
    } else if (initialToken.type === "symbol" && initialToken.token === "(") {
      termNode.insert(initialToken);
      this.#advanceToken();

      termNode.insert(this.#parseExpression());

      this.#insertToken({ node: termNode, expected: { type: "symbol", token: ")" }, caller });
    } else {
      this.#insertToken({
        node: termNode,
        expected: { type: "symbol", token: "-/~" },
        isExpected: isUnaryOperatorToken,
        caller,
      });
      termNode.insert(this.#parseTerm());
    }

    return termNode;
  }

  #parseSubroutineCall({ node }: { node: JackParseTreeNode }) {
    const caller = this.#parseSubroutineCall;

    this.#insertToken({ node, expected: { type: "identifier" }, caller });

    if (this.#currentToken.type === "symbol" && this.#currentToken.token === ".") {
      node.insert(this.#currentToken);
      this.#advanceToken();

      this.#insertToken({ node, expected: { type: "identifier" }, caller });
    }

    this.#insertToken({ node, expected: { type: "symbol", token: "(" }, caller });
    node.insert(this.#parseExpressionList());
    this.#insertToken({ node, expected: { type: "symbol", token: ")" }, caller });
  }

  #parseExpressionList(): JackParseTreeNode {
    const expressionListNode = new JackParseTreeNode({ type: "grammarRule", rule: "expressionList" });

    if (this.#currentToken.type === "symbol" && this.#currentToken.token === ")") {
      return expressionListNode;
    }

    expressionListNode.insert(this.#parseExpression());

    let expressionSeparatorToken = this.#currentToken;
    while (isSeparatorToken(expressionSeparatorToken)) {
      expressionListNode.insert(expressionSeparatorToken);
      this.#advanceToken();

      expressionListNode.insert(this.#parseExpression());

      expressionSeparatorToken = this.#currentToken;
    }

    return expressionListNode;
  }

  #parseArrayIndexing({ node }: { node: JackParseTreeNode }) {
    const caller = this.#parseArrayIndexing;

    const openingSquareBracketToken = this.#currentToken;
    if (openingSquareBracketToken.type === "symbol" && openingSquareBracketToken.token === "[") {
      node.insert(openingSquareBracketToken);
      this.#advanceToken();

      node.insert(this.#parseExpression());
      this.#insertToken({ node, expected: { type: "symbol", token: "]" }, caller });
    }
  }
}

export default JackParser;
