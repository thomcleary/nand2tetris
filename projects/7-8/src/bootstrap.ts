import { FunctionCommand, Symbol } from "./constants.js";
import { callToAssembly } from "./functionCommands.js";
import { AssemblyInstruction } from "./types.js";

export const bootstrap = (): AssemblyInstruction[] => [
  // SP = 256
  "@256",
  "D=A",
  `@${Symbol.SP}`,
  "M=D",
  // call Sys.init,
  ...callToAssembly({
    vmInstruction: { command: FunctionCommand.Call, func: "Sys.init", args: 0 },
    context: { fileName: `Bootstrap.Sys.init` },
  }),
];
