import type { File } from '$lib/types';

export const load = async () => {
	const fileAssets = import.meta.glob('../lib/assets/files/**', { query: '?raw' });

	const files = Object.keys(fileAssets).map(async (filePath) => ({
		path: filePath.replace('../lib/assets/files/', ''),
		contents: (await (fileAssets[filePath]() as Promise<{ default: string }>)).default
	}));

	return { files: (await Promise.all(files)) satisfies File[] };
};
