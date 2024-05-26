export class JackCompilerError extends Error {
  constructor({ caller, message }: { caller: string; message: string }) {
    super(`[${caller}] ${message}`);
    this.name = "JackParserError";
  }
}

export default JackCompilerError;
