import { ArithmeticLogicalCommand, Symbol, Segment, StackCommand, TEMP_OFFSET } from "./constants.js";

export const isEmptyLine = (line: string) => /^\s*$/.test(line);

export const isComment = (line: string) => line.startsWith("//");

export const isArithemticLogicalCommand = (command: string): command is ArithmeticLogicalCommand => {
  const validCommands: string[] = Object.values(ArithmeticLogicalCommand);
  return validCommands.includes(command);
};

export const isStackCommand = (command: string): command is StackCommand => {
  const validCommands: string[] = Object.values(StackCommand);
  return validCommands.includes(command);
};

export const isSegment = (segment: string): segment is Segment => {
  const validSegments: string[] = Object.values(Segment);
  return validSegments.includes(segment);
};

export const isValidIndex = (index: string): boolean => {
  const indexNum = Number(index);
  return !isNaN(indexNum) && indexNum >= 0;
};

export const error = (message: string, { lineNumber }: { lineNumber?: number } = {}) =>
  `error ${lineNumber !== undefined ? `(L${lineNumber}):` : ":"} ${message}`;

export const toComment = (line: string) => `// ${line}` as const;

export const segmentToSymbol = (
  segment: Extract<Segment, Segment.Argument | Segment.Local | Segment.This | Segment.That>
) =>
  ((
    {
      [Segment.Argument]: Symbol.ARG,
      [Segment.Local]: Symbol.LCL,
      [Segment.This]: Symbol.THIS,
      [Segment.That]: Symbol.THAT,
    } as const
  )[segment]);

export const toVariableSymbol = ({ fileName, index }: { fileName: string; index: number }) =>
  `${fileName}.STATIC.${index}` as const;

export const toLabel = (identifier: string, part: string, ...parts: string[]) =>
  `${identifier}.${part}${(parts ?? []).map((p) => `.${p}`).join("")}` as const;
