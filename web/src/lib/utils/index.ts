import { removeComments } from '../../../../projects/10-11/src/utils';

export const toJackProgram = (fileContents: string): string[] =>
	removeComments(fileContents.trim().replaceAll('\r', ''))
		.split('\n')
		.map((l) => l.trim())
		.filter((l) => !!l);
