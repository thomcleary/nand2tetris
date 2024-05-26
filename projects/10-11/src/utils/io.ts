import { existsSync, lstatSync, readFileSync, readdirSync } from "fs";
import { Result } from "../types/index.js";
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

export const toJackProgram = (filePath: string): Result<{ jackProgram: string[] }> => {
  try {
    let jackProgram = readFileSync(filePath).toString();
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

const removeComments = (jackProgram: string) => {
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
