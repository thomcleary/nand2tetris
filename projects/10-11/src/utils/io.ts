import { existsSync, lstatSync, readFileSync, readdirSync } from "fs";
import { Result } from "../types/index.js";
import { error } from "./index.js";

const jackExtension = ".jack";

export const getJackFilePaths = (filePath: string): Result<{ jackFilePaths: readonly string[] }> => {
  if (!existsSync(filePath)) {
    return { success: false, message: error(`${filePath} does not exist`) };
  }

  if (!lstatSync(filePath).isDirectory()) {
    return !filePath.endsWith(jackExtension)
      ? { success: false, message: error(`file type of ${filePath} is not ${jackExtension}`) }
      : { success: true, jackFilePaths: [filePath] };
  }

  const jackFilePaths = readdirSync(filePath)
    .filter((f) => f.endsWith(jackExtension))
    .map((f) => `${filePath}/${f}`);

  return jackFilePaths.length > 0
    ? { success: true, jackFilePaths }
    : { success: false, message: `No ${jackExtension} files found in ${filePath}` };
};

export const getJackFileContents = (filePath: string): Result<{ jackFileContents: string }> => {
  try {
    return { success: true, jackFileContents: readFileSync(filePath).toString() };
  } catch {
    return { success: false, message: error(`unable to read file ${filePath}`) };
  }
};
