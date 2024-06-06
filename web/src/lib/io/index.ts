import { readFileSync } from 'fs';
import type { Result } from '../../../../projects/10-11/src/types';
import { getJackFiles } from '../../../../projects/10-11/src/utils/io';

export const getJackTestFiles = ({
	test
}: {
	test: 'Average' | 'ComplexArrays' | 'ConvertToBin' | 'Pong' | 'Seven' | 'Square';
}) => getJackFiles(`../projects/10-11/tests/11/${test}`);

export const getJackFileContents = (filePath: string): Result<{ jackFileContents: string }> => {
	try {
		return {
			success: true,
			jackFileContents: readFileSync(filePath)
				.toString()
				.trim()
				.replaceAll('\r', '')
				.split('\n')
				.map((l) => l.trimEnd())
				.join('\n')
		};
	} catch {
		return { success: false, message: `unable to read file ${filePath}` };
	}
};
