import { existsSync, lstatSync, readFileSync, readdirSync } from "fs";
import { Result } from "../types.js";
import { error } from "./index.js";

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

export const toJackProgram = (filePath: string): Result<{ jackProgram: string }> => {
  try {
    return {
      success: true,
      // TODO: strip out comments before returning
      // - single line (can be after code or at start of line)
      // - multiline (can start with /* or /**), (can have code after on the final line)
      jackProgram: readFileSync(filePath).toString().trim(),
    };
  } catch {
    return { success: false, message: error(`unable to read file ${filePath}`) };
  }
};
