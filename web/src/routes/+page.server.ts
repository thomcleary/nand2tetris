import { readFileSync } from 'fs';
import type { Result } from '../../../projects/10-11/src/types';

const emptyProgramFileContents =
	'class Main {\n  function void main() {\n    // Your code here\n\n    return;\n  }\n}';

const getJackFileContents = (filePath: string): Result<{ jackFileContents: string }> => {
	try {
		return {
			success: true,
			jackFileContents: readFileSync(filePath).toString().replaceAll('\t', '  ')
		};
	} catch {
		return { success: false, message: `unable to read file ${filePath}` };
	}
};

export const load = (): {
	fizzBuzz: string | undefined;
	empty: typeof emptyProgramFileContents;
} => {
	const fizzBuzzResult = getJackFileContents('./src/lib/jack/FizzBuzz.jack');

	return {
		empty: emptyProgramFileContents,
		fizzBuzz: fizzBuzzResult.success ? fizzBuzzResult.jackFileContents : undefined
	};
};

export const prerender = true;
