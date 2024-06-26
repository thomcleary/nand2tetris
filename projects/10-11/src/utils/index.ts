export const error = (message: string, { lineNumber }: { lineNumber?: number } = {}) =>
  `error${lineNumber !== undefined ? ` (L${lineNumber}):` : ":"} ${message}`;

export const removeComments = (jackProgram: string) => {
  const singleLineMatches = jackProgram.match(/\/\/.*\r?\n/gm);
  const multiLineMatches = jackProgram.match(/\/\*(.|\r?\n)*?\*\//gm);

  let jackProgramWithoutComments = jackProgram;

  singleLineMatches?.forEach((match) => {
    jackProgramWithoutComments = jackProgramWithoutComments.replace(match, "\n");
  });

  multiLineMatches?.forEach((match) => {
    jackProgramWithoutComments = jackProgramWithoutComments.replace(match, "");
  });

  return jackProgramWithoutComments;
};

export const toJackProgram = (jackFileContents: string): string[] =>
  removeComments(jackFileContents.trim().replaceAll("\r", ""))
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => !!l);
