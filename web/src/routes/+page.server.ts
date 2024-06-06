import { getJackFileContents, getJackTestFiles } from '$lib/io';
import { toJackProgram } from '../../../projects/10-11/src/utils/io';

type LoadReturn = {
	jackProgram: {
		contents: string;
		program: string[];
	}[];
};

export const load = () => {
	const jackTestFileResult = getJackTestFiles({ test: 'Average' });

	console.log(jackTestFileResult);

	if (!jackTestFileResult.success) {
		return { jackPrograms: [] };
	}

	const jackPrograms = jackTestFileResult.jackFiles.reduce<LoadReturn['jackProgram']>(
		(prev, curr) => {
			const contentsResult = getJackFileContents(curr);
			const programResult = toJackProgram(curr);

			if (contentsResult.success && programResult.success) {
				prev.push({
					contents: contentsResult.jackFileContents,
					program: programResult.jackProgram
				});
			}

			return prev;
		},
		[]
	);

	return { jackPrograms };
};

export const prerender = true;
