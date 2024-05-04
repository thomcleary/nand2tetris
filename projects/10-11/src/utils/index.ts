export const error = (message: string, { lineNumber }: { lineNumber?: number } = {}) =>
  `error${lineNumber !== undefined ? ` (L${lineNumber}):` : ":"} ${message}`;
