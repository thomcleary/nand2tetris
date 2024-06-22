import type { File } from '$lib/types';
import path from 'path';

export const load = async () => {
	const fileAssets = import.meta.glob('../lib/assets/files/**', { query: '?raw' });

	const files = Object.keys(fileAssets).map(async (filePath) => ({
		path: filePath.replace('../lib/assets/files/', ''),
		name: path.basename(filePath),
		contents: (await (fileAssets[filePath]() as Promise<{ default: string }>)).default
	}));

	return { files: (await Promise.all(files)) satisfies File[] };
};
