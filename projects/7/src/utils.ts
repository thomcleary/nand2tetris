import { ArithmeticLogicalCommand, Pointer, Segment, StackCommand, TEMP_OFFSET } from "./constants.js";

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

export const segmentPointer = (
  segment: Extract<Segment, Segment.Argument | Segment.Local | Segment.This | Segment.That>
) =>
  ({
    [Segment.Argument]: Pointer.ARG,
    [Segment.Local]: Pointer.LCL,
    [Segment.This]: Pointer.THIS,
    [Segment.That]: Pointer.THAT,
  }[segment]);
