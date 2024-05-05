import { Token } from "../tokenizer/types.js";
import { Result } from "../types.js";
import { error } from "../utils/index.js";
import { JackParseTree } from "./JackParseTree.js";
import { ParseError } from "./ParseError.js";
import { isTypeToken } from "./utils.js";

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
      throw new ParseError({
        caller: this.parseClass.name,
        expected: { type: "keyword", token: "class" },
        actual: classKeywordToken,
      });
    }
    parseTree.insert(classKeywordToken);
    this.advanceToken();

    const classNameToken = this.currentToken;
    if (classNameToken.type !== "identifier") {
      throw new ParseError({
        caller: this.parseClass.name,
        expected: { type: "identifier", token: "_<identifier>" },
        actual: classKeywordToken,
      });
    }
    parseTree.insert(classNameToken);
    this.advanceToken();

    const openingCurlyBracketToken = this.currentToken;
    if (openingCurlyBracketToken.type !== "symbol" || openingCurlyBracketToken.token !== "{") {
      throw new ParseError({
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
      throw new ParseError({
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
        throw new ParseError({
          caller: this.parseClassVarDecs.name,
          expected: { type: "keyword/identifier", token: "(int|char|boolean)/_<identifier>" },
          actual: typeToken,
        });
      }
      classVarDec.insert(typeToken);
      this.advanceToken();

      const varNameToken = this.currentToken;
      if (varNameToken.type !== "identifier") {
        throw new ParseError({
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
          throw new ParseError({
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
        throw new ParseError({
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
        throw new ParseError({
          caller: this.parseSubroutineDecs.name,
          expected: { type: "type/void", token: "(int|char|boolean)/_<identifier>/void" },
          actual: returnTypeToken,
        });
      }
      subroutineDecTree.insert(returnTypeToken);
      this.advanceToken();

      const subroutineNameToken = this.currentToken;
      if (subroutineNameToken.type !== "identifier") {
        throw new ParseError({
          caller: this.parseSubroutineDecs.name,
          expected: { type: "identifier" },
          actual: returnTypeToken,
        });
      }
      subroutineDecTree.insert(subroutineNameToken);
      this.advanceToken();

      const openingBracketToken = this.currentToken;
      if (openingBracketToken.type !== "symbol" || openingBracketToken.token !== "(") {
        throw new ParseError({
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
        throw new ParseError({
          caller: this.parseSubroutineDecs.name,
          expected: { type: "symbol", token: ")" },
          actual: closingBracketToken,
        });
      }
      subroutineDecTree.insert(closingBracketToken);
      this.advanceToken();

      // TODO: parseSubroutineBody()

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
      throw new ParseError({
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
        throw new ParseError({
          caller: this.parseParameterList.name,
          expected: { type: "keyword/identifier", token: "(int|char|boolean)/_<identifier>" },
          actual: parameterTypeToken,
        });
      }
      parameterListTree.insert(parameterTypeToken);
      this.advanceToken();

      const parameterNameToken = this.currentToken;
      if (parameterNameToken.type !== "identifier") {
        throw new ParseError({
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
}
