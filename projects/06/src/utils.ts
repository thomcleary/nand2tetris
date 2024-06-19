export const error = ({ message, lineNumber }: { message: string; lineNumber?: number }) =>
  `error ${lineNumber !== undefined ? `(L${lineNumber}):` : ":"} ${message}`;

export const toAssemblyInstructions = (asmFileContents: string) =>
  asmFileContents
    .trim()
    .split("\n")
    .map((line) => line.trim().replaceAll(" ", ""));
