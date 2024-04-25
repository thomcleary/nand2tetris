import { Token } from "../types.js";

// TODO: Tokenize jack program
export const tokenize = (jackProgram: string): readonly Token[] => {
  const segments = jackProgram.split(/\s+/).filter((l) => !!l);

  console.log({ segments });

  return [];
};

export default tokenize;
