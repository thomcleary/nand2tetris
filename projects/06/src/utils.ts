export const error = ({ message, lineNumber }: { message: string; lineNumber?: number }) =>
  `error ${lineNumber !== undefined ? `(L${lineNumber}):` : ":"} ${message}`;
