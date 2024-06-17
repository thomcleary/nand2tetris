import { readFileSync } from 'fs';

const emptyProgramFileContents =
	'class Main {\n  function void main() {\n    // Your code here\n\n    return;\n  }\n}';

const getFileContents = (filePath: string) =>
	readFileSync(filePath).toString().replaceAll('\t', '  ');

export const load = () => {
	return {
		empty: emptyProgramFileContents,
		fizzBuzz: getFileContents('./src/lib/jack/FizzBuzz.jack')
	};
};

export const prerender = true;
