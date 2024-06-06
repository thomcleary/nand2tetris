import { existsSync, lstatSync, readFileSync, readdirSync } from "fs";
import { Result } from "../types/index.js";
import { error, removeComments } from "./index.js";

const jackExtension = ".jack";

export const getJackFiles = (filePath: string): Result<{ jackFiles: readonly string[] }> => {
  if (!existsSync(filePath)) {
    return { success: false, message: error(`${filePath} does not exist`) };
  }

  if (!lstatSync(filePath).isDirectory()) {
    return !filePath.endsWith(jackExtension)
      ? { success: false, message: error(`file type of ${filePath} is not ${jackExtension}`) }
      : { success: true, jackFiles: [filePath] };
  }

  const jackFiles = readdirSync(filePath)
    .filter((f) => f.endsWith(jackExtension))
    .map((f) => `${filePath}/${f}`);

  return jackFiles.length > 0
    ? { success: true, jackFiles }
    : { success: false, message: `No ${jackExtension} files found in ${filePath}` };
};

export const toJackProgram = (filePath: string): Result<{ jackProgram: string[] }> => {
  try {
    let jackProgram = readFileSync(filePath).toString();
    // TODO: the JackCompiler should be responsible for doing this internally
    // Change the JackCompiler.compile() method to accept a string (the file contents)
    // And do all of this setup as part of the compiler so the web project doesnt also have to do its own version of this
    jackProgram = jackProgram.trim().replaceAll("\r", "");
    jackProgram = removeComments(jackProgram);

    return {
      success: true,
      jackProgram: jackProgram
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => !!l),
    };
  } catch {
    return { success: false, message: error(`unable to read file ${filePath}`) };
  }
};
