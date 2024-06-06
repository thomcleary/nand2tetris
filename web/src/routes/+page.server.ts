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
	defaultFileContents: string;
	emptyProgramFileContents: typeof emptyProgramFileContents;
} => {
	const fileContentsResult = getJackFileContents('./src/lib/jack/Main.jack');

	return {
		defaultFileContents: fileContentsResult.success
			? fileContentsResult.jackFileContents
			: emptyProgramFileContents,
		emptyProgramFileContents
	};
};

export const prerender = true;
