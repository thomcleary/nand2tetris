import { KeywordToken, SymbolToken, Token } from "../tokenizer/types.js";
import { Result } from "../types.js";
import { error } from "../utils/index.js";
import JackParseTree from "./JackParseTree.js";
import JackParserError from "./JackParserError.js";
import {
  isClassVarKeywordToken,
  isSeparatorToken,
  isStatementToken,
  isSubroutineTypeToken,
  isTypeToken,
} from "./utils.js";

export class JackParser {
  private tokens: readonly Token[] = [];
  private currentTokenIndex = 0;

  private get currentToken() {
    const token = this.tokens[this.currentTokenIndex];

    if (!token) {
      throw new RangeError("[nextToken] currentTokenIndex out of range for tokens");
    }

    console.log({ currentToken: token });
    return token;
  }

  constructor() {}

  public parse(tokens: readonly Token[]): Result<{ jackParseTree: JackParseTree }> {
    this.tokens = tokens;
    this.reset();

    try {
      return { success: true, jackParseTree: this.parseClass() };
    } catch (e) {
      return { success: false, message: error(e instanceof Error ? e.message : "Failed to parse tokens") };
    }
  }

  private reset() {
    this.currentTokenIndex = 0;
  }

  private advanceToken() {
    console.log("advanceToken()");
    this.currentTokenIndex++;
  }

  private insertToken({
    tree,
    expected,
    caller,
    ...rest
  }:
    | {
        tree: JackParseTree;
        isExpected?: never;
        expected: KeywordToken | SymbolToken | Omit<Exclude<Token, KeywordToken | SymbolToken>, "token">;
        caller: { name: string };
      }
    | {
        tree: JackParseTree;
        isExpected: (token: Token) => boolean;
        expected: { type: string; token: string };
        caller: { name: string };
      }) {
    const token = this.currentToken;

    if (rest.isExpected) {
      if (!rest.isExpected(token)) {
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

    tree.insert(token);
    this.advanceToken();
  }

  private parseClass(): JackParseTree {
    const caller = this.parseClass;
    const parseTree = new JackParseTree({ grammarRule: "class" });

    this.insertToken({ tree: parseTree, expected: { type: "keyword", token: "class" }, caller });
    this.insertToken({ tree: parseTree, expected: { type: "identifier" }, caller });
    this.insertToken({ tree: parseTree, expected: { type: "symbol", token: "{" }, caller });
    parseTree.insert(this.parseClassVarDecs());
    parseTree.insert(this.parseSubroutineDecs());
    this.insertToken({ tree: parseTree, expected: { type: "symbol", token: "}" }, caller });

    // TODO: final insertToken might advance currentTokenIndex beyond array size, but probably fine?

    return parseTree;
  }

  private parseClassVarDecs(): JackParseTree[] {
    const caller = this.parseClassVarDecs;
    const classVarDecTrees: JackParseTree[] = [];

    let classVarKeywordToken = this.currentToken;
    while (isClassVarKeywordToken(classVarKeywordToken)) {
      const classVarDecTree = new JackParseTree({ grammarRule: "classVarDec" });

      classVarDecTree.insert(classVarKeywordToken);
      this.advanceToken();

      this.insertToken({
        tree: classVarDecTree,
        expected: { type: "keyword/identifier", token: "(int|char|boolean)/_<identifier>" },
        isExpected: isTypeToken,
        caller,
      });
      this.insertToken({ tree: classVarDecTree, expected: { type: "identifier" }, caller });

      let varDecSeparatorToken = this.currentToken;
      while (isSeparatorToken(varDecSeparatorToken)) {
        classVarDecTree.insert(varDecSeparatorToken);
        this.advanceToken();

        this.insertToken({ tree: classVarDecTree, expected: { type: "identifier" }, caller });

        varDecSeparatorToken = this.currentToken;
      }

      this.insertToken({ tree: classVarDecTree, expected: { type: "symbol", token: ";" }, caller });

      classVarDecTrees.push(classVarDecTree);
      classVarKeywordToken = this.currentToken;
    }

    return classVarDecTrees;
  }

  private parseSubroutineDecs(): JackParseTree[] {
    const caller = this.parseSubroutineDecs;
    const subroutineDecTrees: JackParseTree[] = [];

    let subroutineTypeToken = this.currentToken;
    while (isSubroutineTypeToken(subroutineTypeToken)) {
      const subroutineDecTree = new JackParseTree({ grammarRule: "subroutineDec" });
      subroutineDecTree.insert(subroutineTypeToken);
      this.advanceToken();

      this.insertToken({
        tree: subroutineDecTree,
        expected: { type: "type/void", token: "(int|char|boolean)/_<identifier>/void" },
        isExpected: (token) => isTypeToken(token) || (token.type === "keyword" && token.token === "void"),
        caller,
      });
      this.insertToken({ tree: subroutineDecTree, expected: { type: "identifier" }, caller });
      this.insertToken({ tree: subroutineDecTree, expected: { type: "symbol", token: "(" }, caller });
      subroutineDecTree.insert(this.parseParameterList());
      this.insertToken({ tree: subroutineDecTree, expected: { type: "symbol", token: ")" }, caller });
      subroutineDecTree.insert(this.parseSubroutineBody());

      subroutineDecTrees.push(subroutineDecTree);
      subroutineTypeToken = this.currentToken;
    }

    return subroutineDecTrees;
  }

  private parseParameterList(): JackParseTree {
    const caller = this.parseParameterList;
    const parameterListTree = new JackParseTree({ grammarRule: "parameterList" });

    const parameterTypeToken = this.currentToken;
    if (!isTypeToken(parameterTypeToken)) {
      return parameterListTree;
    }
    parameterListTree.insert(parameterTypeToken);
    this.advanceToken();

    this.insertToken({ tree: parameterListTree, expected: { type: "identifier" }, caller });

    let parameterSeparatorToken = this.currentToken;
    while (isSeparatorToken(parameterSeparatorToken)) {
      parameterListTree.insert(parameterSeparatorToken);
      this.advanceToken();

      this.insertToken({
        tree: parameterListTree,
        expected: { type: "keyword/identifier", token: "(int|char|boolean)/_<identifier>" },
        isExpected: isTypeToken,
        caller,
      });
      this.insertToken({ tree: parameterListTree, expected: { type: "identifier" }, caller });

      parameterSeparatorToken = this.currentToken;
    }

    return parameterListTree;
  }

  private parseSubroutineBody(): JackParseTree {
    const caller = this.parseSubroutineBody;
    const subroutineBodyTree = new JackParseTree({ grammarRule: "subroutineBody" });

    this.insertToken({ tree: subroutineBodyTree, expected: { type: "symbol", token: "{" }, caller });
    subroutineBodyTree.insert(this.parseVarDecs());
    subroutineBodyTree.insert(this.parseStatements());
    this.insertToken({ tree: subroutineBodyTree, expected: { type: "symbol", token: "}" }, caller });

    return subroutineBodyTree;
  }

  private parseVarDecs(): JackParseTree[] {
    const caller = this.parseVarDecs;
    const varDecTrees: JackParseTree[] = [];

    let varToken = this.currentToken;
    while (varToken.type === "keyword" && varToken.token === "var") {
      const varDecTree = new JackParseTree({ grammarRule: "varDec" });
      this.advanceToken();

      this.insertToken({
        tree: varDecTree,
        expected: { type: "keyword/identifier", token: "(int|char|boolean)/_<identifier>" },
        isExpected: isTypeToken,
        caller,
      });
      this.insertToken({ tree: varDecTree, expected: { type: "identifier" }, caller });

      let varDecSeparatorToken = this.currentToken;
      while (isSeparatorToken(varDecSeparatorToken)) {
        varDecTree.insert(varDecSeparatorToken);
        this.advanceToken();

        this.insertToken({ tree: varDecTree, expected: { type: "identifier" }, caller });

        varDecSeparatorToken = this.currentToken;
      }

      this.insertToken({ tree: varDecTree, expected: { type: "symbol", token: ";" }, caller });

      varDecTrees.push(varDecTree);
      varToken = this.currentToken;
    }

    return varDecTrees;
  }

  // TODO: parseStatements (without expressions and arrays)
  // TODO: parseStatements (with expressions and arrays)
  private parseStatements(): JackParseTree {
    const statementsTree = new JackParseTree({ grammarRule: "statements" });

    const statementMap = {
      let: this.parseLetStatement,
      if: this.parseIfStatement,
      while: this.parseWhileStatement,
      do: this.parseDoStatement,
      return: this.parseReturnStatement,
    } as const;

    let statementToken = this.currentToken;
    while (isStatementToken(statementToken)) {
      statementsTree.insert(statementMap[statementToken.token].bind(this)());
      // TODO: need to advance token, or handled by statement methods already?
      statementToken = this.currentToken;
    }

    return statementsTree;
  }

  private parseLetStatement(): JackParseTree {
    const caller = this.parseLetStatement;
    const letStatementTree = new JackParseTree({ grammarRule: "letStatement" });

    this.insertToken({ tree: letStatementTree, expected: { type: "keyword", token: "let" }, caller });
    this.insertToken({ tree: letStatementTree, expected: { type: "identifier" }, caller });
    // TODO: parse array indexing, varName[expression]
    this.insertToken({ tree: letStatementTree, expected: { type: "symbol", token: "=" }, caller });
    letStatementTree.insert(this.parseExpression());
    this.insertToken({ tree: letStatementTree, expected: { type: "symbol", token: ";" }, caller });

    return letStatementTree;
  }

  private parseIfStatement(): JackParseTree {
    const caller = this.parseIfStatement;
    const ifStatementTree = new JackParseTree({ grammarRule: "ifStatement" });

    this.insertToken({ tree: ifStatementTree, expected: { type: "keyword", token: "if" }, caller });
    this.insertToken({ tree: ifStatementTree, expected: { type: "symbol", token: "(" }, caller });
    ifStatementTree.insert(this.parseExpression());
    this.insertToken({ tree: ifStatementTree, expected: { type: "symbol", token: ")" }, caller });
    this.insertToken({ tree: ifStatementTree, expected: { type: "symbol", token: "{" }, caller });
    ifStatementTree.insert(this.parseStatements());
    this.insertToken({ tree: ifStatementTree, expected: { type: "symbol", token: "}" }, caller });

    const elseToken = this.currentToken;
    if (elseToken.type === "keyword" && elseToken.token === "else") {
      ifStatementTree.insert(elseToken);
      this.advanceToken();

      this.insertToken({ tree: ifStatementTree, expected: { type: "symbol", token: "{" }, caller });
      ifStatementTree.insert(this.parseStatements());
      this.insertToken({ tree: ifStatementTree, expected: { type: "symbol", token: "}" }, caller });
    }

    return ifStatementTree;
  }

  private parseWhileStatement(): JackParseTree {
    const whileStatementTree = new JackParseTree({ grammarRule: "whileStatement" });

    // TODO

    return whileStatementTree;
  }

  private parseDoStatement(): JackParseTree {
    const caller = this.parseDoStatement;
    const doStatementTree = new JackParseTree({ grammarRule: "doStatement" });

    this.insertToken({ tree: doStatementTree, expected: { type: "keyword", token: "do" }, caller });
    this.parseSubroutineCall({ tree: doStatementTree });
    this.insertToken({ tree: doStatementTree, expected: { type: "symbol", token: ";" }, caller });

    return doStatementTree;
  }

  private parseReturnStatement(): JackParseTree {
    const caller = this.parseReturnStatement;
    const returnStatementTree = new JackParseTree({ grammarRule: "returnStatement" });

    this.insertToken({ tree: returnStatementTree, expected: { type: "keyword", token: "return" }, caller });

    if (this.currentToken.type !== "symbol" || this.currentToken.token !== ";") {
      returnStatementTree.insert(this.parseExpression());
    }

    this.insertToken({ tree: returnStatementTree, expected: { type: "symbol", token: ";" }, caller });

    return returnStatementTree;
  }

  // TODO: parse expressions instead of just returning identifier
  private parseExpression(): JackParseTree {
    const expressionTree = new JackParseTree({ grammarRule: "expression" });

    expressionTree.insert(this.parseTerm());

    return expressionTree;
  }

  // TODO: parse terms instead of just returning identifier
  private parseTerm(): JackParseTree {
    const caller = this.parseTerm;

    const termTree = new JackParseTree({ grammarRule: "term" });

    this.insertToken({ tree: termTree, expected: { type: "identifier" }, caller });

    return termTree;
  }

  private parseSubroutineCall({ tree }: { tree: JackParseTree }) {
    const caller = this.parseSubroutineCall;

    this.insertToken({ tree, expected: { type: "identifier" }, caller });

    if (this.currentToken.type === "symbol" && this.currentToken.token === ".") {
      tree.insert(this.currentToken);
      this.advanceToken();

      this.insertToken({ tree, expected: { type: "identifier" }, caller });
    }

    this.insertToken({ tree, expected: { type: "symbol", token: "(" }, caller });
    tree.insert(this.parseExpressionList());
    this.insertToken({ tree, expected: { type: "symbol", token: ")" }, caller });
  }

  private parseExpressionList(): JackParseTree {
    const expressionListTree = new JackParseTree({ grammarRule: "expressionList" });

    if (this.currentToken.type === "symbol" && this.currentToken.token === ")") {
      return expressionListTree;
    }

    expressionListTree.insert(this.parseExpression());

    let expressionSeparatorToken = this.currentToken;
    while (isSeparatorToken(expressionSeparatorToken)) {
      expressionListTree.insert(expressionSeparatorToken);
      this.advanceToken();

      expressionListTree.insert(this.parseExpression());

      expressionSeparatorToken = this.currentToken;
    }

    return expressionListTree;
  }
}

export default JackParser;
