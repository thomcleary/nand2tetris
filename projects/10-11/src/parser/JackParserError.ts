import { Token } from "../tokenizer/types.js";

export class JackParserError extends Error {
  constructor({
    caller,
    expected,
    actual,
  }: {
    caller: string;
    expected: Partial<Token | { type: string; token: string }>;
    actual: Token;
  }) {
    const expectedMessage =
      expected.type && expected.token ? `${expected.type}-${expected.token}` : expected.type ?? expected.token ?? "";
    super(`[${caller}] expected ${expectedMessage}, but was ${actual.type}-${actual.token}`);
    this.name = "JackParserError";
  }
}

export default JackParserError;
