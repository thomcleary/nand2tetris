import { Token } from "../tokenizer/types.js";
import { Result } from "../types.js";
import { error } from "../utils/index.js";
import { JackParseTree } from "./JackParseTree.js";
import { isTypeToken } from "./utils.js";

export const parse = (tokens: readonly Token[]): Result<{ parseTree: JackParseTree }> => {
  const jackParser = new JackParser(tokens);

  try {
    return { success: true, parseTree: jackParser.parse() };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : error("Failed to parse tokens") };
  }
};

class JackParser {
  private tokens: readonly Token[];
  private currentTokenIndex = 0;

  private get currentToken() {
    const token = this.tokens[this.currentTokenIndex];

    if (!token) {
      throw new RangeError("(nextToken): currentTokenIndex out of range for tokens");
    }

    return token;
  }

  constructor(tokens: readonly Token[]) {
    this.tokens = tokens;
  }

  public parse(): JackParseTree {
    this.reset();
    return this.parseClass();
  }

  private reset() {
    this.currentTokenIndex = 0;
  }

  private advanceToken() {
    this.currentTokenIndex++;
  }

  private error({
    method,
    expected,
    actual,
  }: {
    method: string;
    expected: Token | { type: string; token: string };
    actual: Token;
  }): never {
    throw new Error(`(${method}): expected ${expected.type}-${expected.token}, but was ${actual.type}-${actual.token}`);
  }

  private parseClass(): JackParseTree {
    const parseTree = new JackParseTree({ grammarRule: "class" });

    const classKeywordToken = this.currentToken;
    if (classKeywordToken.type !== "keyword" || classKeywordToken.token !== "class") {
      this.error({
        method: this.parseClass.name,
        expected: { type: "keyword", token: "class" },
        actual: classKeywordToken,
      });
    }
    parseTree.insert(classKeywordToken);
    this.advanceToken();

    const classNameToken = this.currentToken;
    if (classNameToken.type !== "identifier") {
      this.error({
        method: this.parseClass.name,
        expected: { type: "identifier", token: "_<identifier>" },
        actual: classKeywordToken,
      });
    }
    parseTree.insert(classNameToken);
    this.advanceToken();

    const openingCurlyBracketToken = this.currentToken;
    if (openingCurlyBracketToken.type !== "symbol" || openingCurlyBracketToken.token !== "{") {
      this.error({
        method: this.parseClass.name,
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
      this.error({
        method: this.parseClass.name,
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
      classVarDec.insert(this.currentToken);
      this.advanceToken();

      const typeToken = this.currentToken;
      if (!isTypeToken(typeToken)) {
        this.error({
          method: this.parseClassVarDecs.name,
          expected: { type: "keyword/identifier", token: "(int|char|boolean)/_<identifier>" },
          actual: typeToken,
        });
      }
      classVarDec.insert(typeToken);
      this.advanceToken();

      const varNameToken = this.currentToken;
      if (varNameToken.type !== "identifier") {
        this.error({
          method: this.parseClassVarDecs.name,
          expected: { type: "identifier", token: "_<identifier>" },
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
          this.error({
            method: this.parseClassVarDecs.name,
            expected: { type: "identifier", token: "_<identifier>" },
            actual: varNameToken,
          });
        }
        classVarDec.insert(varNameToken);
        this.advanceToken();

        varDecSeparatorToken = this.currentToken;
      }

      const semiColonToken = this.currentToken;
      if (semiColonToken.type !== "symbol" || semiColonToken.token !== ";") {
        this.error({
          method: this.parseClassVarDecs.name,
          expected: { type: "symbol", token: ";" },
          actual: semiColonToken,
        });
      }
      classVarDec.insert(semiColonToken);

      classVarDecTrees.push(classVarDec);
      staticOrFieldToken = this.currentToken;
    }

    this.advanceToken();

    return classVarDecTrees;
  }

  // TODO
  private parseSubroutineDecs(): JackParseTree[] {
    return [];
  }
}
