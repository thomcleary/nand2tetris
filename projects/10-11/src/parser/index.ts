import { Token } from "../tokenizer/types.js";
import { Result } from "../types.js";
import { error } from "../utils/index.js";
import { JackParseTree } from "./JackParseTree.js";

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

  private error({ method, expected, actual }: { method: string; expected: Token; actual: Token }): never {
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

    const classVarDec = this.parseClassVarDec();
    if (classVarDec) {
      parseTree.insert(classVarDec);
    }

    const subroutineDec = this.parseSubroutineDec();
    if (subroutineDec) {
      parseTree.insert(subroutineDec);
    }

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

  private parseClassVarDec(): JackParseTree | undefined {
    return undefined;

    const parseTree = new JackParseTree({ grammarRule: "classVarDec" });
  }

  private parseSubroutineDec(): JackParseTree | undefined {
    return undefined;

    const parseTree = new JackParseTree({ grammarRule: "subroutineDec" });
  }
}
