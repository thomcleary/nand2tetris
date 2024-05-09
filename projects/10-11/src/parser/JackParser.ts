import { Token } from "../tokenizer/types.js";
import { Result } from "../types.js";
import { error } from "../utils/index.js";
import JackParseTree from "./JackParseTree.js";
import JackParserError from "./JackParserError.js";
import { isStatementToken, isTypeToken } from "./utils.js";

// TODO: potentially could pull out individual token parsing into private methods for tokens
// that are parsed frequently, like opening/closing brackets?
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

  private parseClass(): JackParseTree {
    const parseTree = new JackParseTree({ grammarRule: "class" });

    const classKeywordToken = this.currentToken;
    if (classKeywordToken.type !== "keyword" || classKeywordToken.token !== "class") {
      throw new JackParserError({
        caller: this.parseClass.name,
        expected: { type: "keyword", token: "class" },
        actual: classKeywordToken,
      });
    }
    parseTree.insert(classKeywordToken);
    this.advanceToken();

    const classNameToken = this.currentToken;
    if (classNameToken.type !== "identifier") {
      throw new JackParserError({
        caller: this.parseClass.name,
        expected: { type: "identifier", token: "_<identifier>" },
        actual: classKeywordToken,
      });
    }
    parseTree.insert(classNameToken);
    this.advanceToken();

    const openingCurlyBracketToken = this.currentToken;
    if (openingCurlyBracketToken.type !== "symbol" || openingCurlyBracketToken.token !== "{") {
      throw new JackParserError({
        caller: this.parseClass.name,
        expected: { type: "symbol", token: "{" },
        actual: openingCurlyBracketToken,
      });
    }
    parseTree.insert(openingCurlyBracketToken);
    this.advanceToken();

    this.parseClassVarDecs().forEach((tree) => parseTree.insert(tree));
    this.parseSubroutineDecs().forEach((tree) => parseTree.insert(tree));

    const closingCurlyBracketToken = this.currentToken;
    if (closingCurlyBracketToken.type !== "symbol" || closingCurlyBracketToken.token !== "}") {
      throw new JackParserError({
        caller: this.parseClass.name,
        expected: { type: "symbol", token: "}" },
        actual: closingCurlyBracketToken,
      });
    }
    parseTree.insert(closingCurlyBracketToken);

    return parseTree;
  }

  private parseClassVarDecs(): JackParseTree[] {
    const classVarDecTrees: JackParseTree[] = [];

    let staticOrFieldToken = this.currentToken;
    while (
      staticOrFieldToken.type === "keyword" &&
      (staticOrFieldToken.token === "static" || staticOrFieldToken.token === "field")
    ) {
      const classVarDec = new JackParseTree({ grammarRule: "classVarDec" });
      classVarDec.insert(staticOrFieldToken);
      this.advanceToken();

      const typeToken = this.currentToken;
      if (!isTypeToken(typeToken)) {
        throw new JackParserError({
          caller: this.parseClassVarDecs.name,
          expected: { type: "keyword/identifier", token: "(int|char|boolean)/_<identifier>" },
          actual: typeToken,
        });
      }
      classVarDec.insert(typeToken);
      this.advanceToken();

      const varNameToken = this.currentToken;
      if (varNameToken.type !== "identifier") {
        throw new JackParserError({
          caller: this.parseClassVarDecs.name,
          expected: { type: "identifier" },
          actual: typeToken,
        });
      }
      classVarDec.insert(varNameToken);
      this.advanceToken();

      let varDecSeparatorToken = this.currentToken;
      while (varDecSeparatorToken.type === "symbol" && varDecSeparatorToken.token === ",") {
        classVarDec.insert(varDecSeparatorToken);
        this.advanceToken();

        const varNameToken = this.currentToken;
        if (varNameToken.type !== "identifier") {
          throw new JackParserError({
            caller: this.parseClassVarDecs.name,
            expected: { type: "identifier" },
            actual: varNameToken,
          });
        }
        classVarDec.insert(varNameToken);
        this.advanceToken();

        varDecSeparatorToken = this.currentToken;
      }

      const semiColonToken = this.currentToken;
      if (semiColonToken.type !== "symbol" || semiColonToken.token !== ";") {
        throw new JackParserError({
          caller: this.parseClassVarDecs.name,
          expected: { type: "symbol", token: ";" },
          actual: semiColonToken,
        });
      }
      classVarDec.insert(semiColonToken);
      this.advanceToken();

      classVarDecTrees.push(classVarDec);
      staticOrFieldToken = this.currentToken;
    }

    return classVarDecTrees;
  }

  private parseSubroutineDecs(): JackParseTree[] {
    const subroutineDecTrees: JackParseTree[] = [];

    let subroutineTypeToken = this.currentToken;

    while (
      subroutineTypeToken.type === "keyword" &&
      (subroutineTypeToken.token === "constructor" ||
        subroutineTypeToken.token === "function" ||
        subroutineTypeToken.token === "method")
    ) {
      const subroutineDecTree = new JackParseTree({ grammarRule: "subroutineDec" });
      subroutineDecTree.insert(subroutineTypeToken);
      this.advanceToken();

      const returnTypeToken = this.currentToken;
      if (!isTypeToken(returnTypeToken) && !(returnTypeToken.type === "keyword" && returnTypeToken.token === "void")) {
        throw new JackParserError({
          caller: this.parseSubroutineDecs.name,
          expected: { type: "type/void", token: "(int|char|boolean)/_<identifier>/void" },
          actual: returnTypeToken,
        });
      }
      subroutineDecTree.insert(returnTypeToken);
      this.advanceToken();

      const subroutineNameToken = this.currentToken;
      if (subroutineNameToken.type !== "identifier") {
        throw new JackParserError({
          caller: this.parseSubroutineDecs.name,
          expected: { type: "identifier" },
          actual: returnTypeToken,
        });
      }
      subroutineDecTree.insert(subroutineNameToken);
      this.advanceToken();

      const openingBracketToken = this.currentToken;
      if (openingBracketToken.type !== "symbol" || openingBracketToken.token !== "(") {
        throw new JackParserError({
          caller: this.parseSubroutineDecs.name,
          expected: { type: "symbol", token: "(" },
          actual: openingBracketToken,
        });
      }
      subroutineDecTree.insert(openingBracketToken);
      this.advanceToken();

      subroutineDecTree.insert(this.parseParameterList());

      const closingBracketToken = this.currentToken;
      if (closingBracketToken.type !== "symbol" || closingBracketToken.token !== ")") {
        throw new JackParserError({
          caller: this.parseSubroutineDecs.name,
          expected: { type: "symbol", token: ")" },
          actual: closingBracketToken,
        });
      }
      subroutineDecTree.insert(closingBracketToken);
      this.advanceToken();

      subroutineDecTree.insert(this.parseSubroutineBody());

      subroutineDecTrees.push(subroutineDecTree);
      subroutineTypeToken = this.currentToken;
    }

    return subroutineDecTrees;
  }

  private parseParameterList(): JackParseTree {
    const parameterListTree = new JackParseTree({ grammarRule: "parameterList" });

    const parameterTypeToken = this.currentToken;
    if (!isTypeToken(parameterTypeToken)) {
      return parameterListTree;
    }
    parameterListTree.insert(parameterTypeToken);
    this.advanceToken();

    const parameterNameToken = this.currentToken;
    if (parameterNameToken.type !== "identifier") {
      throw new JackParserError({
        caller: this.parseParameterList.name,
        expected: { type: "identifier" },
        actual: parameterNameToken,
      });
    }
    parameterListTree.insert(parameterNameToken);
    this.advanceToken();

    let parameterSeparatorToken = this.currentToken;

    while (parameterSeparatorToken.type === "symbol" && parameterSeparatorToken.token === ",") {
      parameterListTree.insert(parameterSeparatorToken);
      this.advanceToken();

      const parameterTypeToken = this.currentToken;
      if (!isTypeToken(parameterTypeToken)) {
        throw new JackParserError({
          caller: this.parseParameterList.name,
          expected: { type: "keyword/identifier", token: "(int|char|boolean)/_<identifier>" },
          actual: parameterTypeToken,
        });
      }
      parameterListTree.insert(parameterTypeToken);
      this.advanceToken();

      const parameterNameToken = this.currentToken;
      if (parameterNameToken.type !== "identifier") {
        throw new JackParserError({
          caller: this.parseParameterList.name,
          expected: { type: "identifier" },
          actual: parameterNameToken,
        });
      }
      parameterListTree.insert(parameterNameToken);
      this.advanceToken();

      parameterSeparatorToken = this.currentToken;
    }

    return parameterListTree;
  }

  private parseSubroutineBody(): JackParseTree {
    const subroutineBodyTree = new JackParseTree({ grammarRule: "subroutineBody" });

    const openingCurlyBracketToken = this.currentToken;
    if (openingCurlyBracketToken.type !== "symbol" || openingCurlyBracketToken.token !== "{") {
      throw new JackParserError({
        caller: this.parseSubroutineBody.name,
        expected: { type: "symbol", token: "{" },
        actual: openingCurlyBracketToken,
      });
    }
    subroutineBodyTree.insert(openingCurlyBracketToken);
    this.advanceToken();

    this.parseVarDecs().forEach((tree) => subroutineBodyTree.insert(tree));
    subroutineBodyTree.insert(this.parseStatements());

    const closingCurlyBracketToken = this.currentToken;
    if (closingCurlyBracketToken.type !== "symbol" || closingCurlyBracketToken.token !== "}") {
      throw new JackParserError({
        caller: this.parseSubroutineBody.name,
        expected: { type: "symbol", token: "}" },
        actual: closingCurlyBracketToken,
      });
    }
    subroutineBodyTree.insert(closingCurlyBracketToken);
    this.advanceToken();

    return subroutineBodyTree;
  }

  private parseVarDecs(): JackParseTree[] {
    const varDecTrees: JackParseTree[] = [];

    let varToken = this.currentToken;
    while (varToken.type === "keyword" && varToken.token === "var") {
      const varDecTree = new JackParseTree({ grammarRule: "varDec" });
      this.advanceToken();

      const typeToken = this.currentToken;
      if (!isTypeToken(typeToken)) {
        throw new JackParserError({
          caller: this.parseVarDecs.name,
          expected: { type: "keyword/identifier", token: "(int|char|boolean)/_<identifier>" },
          actual: typeToken,
        });
      }
      varDecTree.insert(typeToken);
      this.advanceToken();

      const varNameToken = this.currentToken;
      if (varNameToken.type !== "identifier") {
        throw new JackParserError({
          caller: this.parseVarDecs.name,
          expected: { type: "identifier", token: "_<identifier>" },
          actual: varNameToken,
        });
      }
      varDecTree.insert(varNameToken);
      this.advanceToken();

      let varDecSeparatorToken = this.currentToken;
      while (varDecSeparatorToken.type === "symbol" && varDecSeparatorToken.token === ",") {
        varDecTree.insert(varDecSeparatorToken);
        this.advanceToken();

        const varNameToken = this.currentToken;
        if (varNameToken.type !== "identifier") {
          throw new JackParserError({
            caller: this.parseVarDecs.name,
            expected: { type: "identifier" },
            actual: varNameToken,
          });
        }
        varDecTree.insert(varNameToken);
        this.advanceToken();

        varDecSeparatorToken = this.currentToken;
      }

      const semiColonToken = this.currentToken;
      if (semiColonToken.type !== "symbol" || semiColonToken.token !== ";") {
        throw new JackParserError({
          caller: this.parseVarDecs.name,
          expected: { type: "symbol", token: ";" },
          actual: semiColonToken,
        });
      }
      varDecTree.insert(semiColonToken);
      this.advanceToken();

      varDecTrees.push(varDecTree);
      varToken = this.currentToken;
    }

    return varDecTrees;
  }

  // TODO: parseStatements (without expressions and arrays)
  // TODO: parseStatements (with expressions and arrays)
  private parseStatements(): JackParseTree {
    const statementsTree = new JackParseTree({ grammarRule: "statements" });

    let statementToken = this.currentToken;
    while (isStatementToken(statementToken)) {
      if (statementToken.token === "let") {
        statementsTree.insert(this.parseLetStatement());
      } else if (statementToken.token === "if") {
        statementsTree.insert(this.parseIfStatement());
      } else if (statementToken.token === "while") {
        statementsTree.insert(this.parseWhileStatement());
      } else if (statementToken.token === "do") {
        statementsTree.insert(this.parseDoStatement());
      } else {
        statementsTree.insert(this.parseReturnStatement());
      }

      // TODO: need to advance token, or handled by statement methods already?
      statementToken = this.currentToken;
    }
    return statementsTree;
  }

  // TODO: parseLetStatement (without expressions and arrays)
  // TODO: parseLetStatement (with expressions and arrays)
  private parseLetStatement(): JackParseTree {
    const letStatementTree = new JackParseTree({ grammarRule: "letStatement" });

    // TODO

    return letStatementTree;
  }

  // TODO: parseIfStatement (without expressions and arrays)
  // TODO: parseIfStatement (with expressions and arrays)
  private parseIfStatement(): JackParseTree {
    const ifStatementTree = new JackParseTree({ grammarRule: "ifStatement" });

    // TODO

    return ifStatementTree;
  }

  // TODO: parseWhileStatement (without expressions and arrays)
  // TODO: parseWhileStatement (with expressions and arrays)
  private parseWhileStatement(): JackParseTree {
    const whileStatementTree = new JackParseTree({ grammarRule: "whileStatement" });

    // TODO

    return whileStatementTree;
  }

  // TODO: parseDoStatement (without expressions and arrays)
  // TODO: parseDoStatement (with expressions and arrays)
  private parseDoStatement(): JackParseTree {
    const doStatementTree = new JackParseTree({ grammarRule: "doStatement" });

    // TODO

    return doStatementTree;
  }

  // TODO: parseReturnStatement (without expressions and arrays)
  // TODO: parseReturnStatement (with expressions and arrays)
  private parseReturnStatement(): JackParseTree {
    const returnStatementTree = new JackParseTree({ grammarRule: "returnStatement" });

    // TODO

    return returnStatementTree;
  }
}

export default JackParser;
