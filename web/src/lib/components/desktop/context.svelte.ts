import type { File } from '$lib/types';
import { getContext, setContext } from 'svelte';

const contextKey = 'finder';

export const setFinder = ({ files }: { files: File[] }) => {
	const _files = $state(files);

	const finder = {
		get files() {
			return _files;
		}
	};

	setContext(contextKey, finder);

	return finder;
};

export const getFinder = () => {
	const finderContext = getContext<ReturnType<typeof setFinder> | undefined>(contextKey);

	if (!finderContext) {
		throw new Error('getFinder must be called from within a component that has called setFinder');
	}

	return finderContext;
};
