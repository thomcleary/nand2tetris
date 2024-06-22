import type { File } from '$lib/types';
import { getContext, setContext } from 'svelte';

export type Nand2TetrisContext = {
	openFiles: File[];
	selectedFile: File | undefined;
	closeFile: (file: File) => void;
};

const contextKey = 'nand2tetris';

export const setNand2TetrisContext = () => {
	let openFiles = $state<File[]>([]);
	let selectedFile = $state<File>();

	const context = {
		get openFiles() {
			return openFiles;
		},

		get selectedFile() {
			return selectedFile;
		},

		set selectedFile(file: File | undefined) {
			if (file && !openFiles.includes(file)) {
				openFiles.push(file);
			}
			selectedFile = file;
		},

		closeFile(file: File) {
			openFiles = openFiles.filter((f) => f !== file);

			if (selectedFile === file) {
				selectedFile = openFiles[0];
			}
		}
	} satisfies Nand2TetrisContext;

	setContext(contextKey, context);

	return context;
};

export const getNand2TetrisContext = () => {
	const context = getContext<ReturnType<typeof setNand2TetrisContext> | undefined>(contextKey);

	if (!context) {
		throw new Error(
			'getNand2TetrisContext must be called from within a component that has called setNand2TetrisContext'
		);
	}

	return context;
};
