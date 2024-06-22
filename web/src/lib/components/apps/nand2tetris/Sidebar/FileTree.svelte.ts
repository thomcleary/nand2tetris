import type { File as FileDetails } from '$lib/types';
import { getNand2TetrisContext } from '../context.svelte';

export type File = {
	isDir: false;
	name: string;
	selected: boolean;
	open: boolean;
	select: () => void;
};
export type Directory = { isDir: true; name: string; files: (Directory | File)[]; open: boolean };

const createFile = ({ file }: { file: FileDetails }): File => {
	const context = getNand2TetrisContext();
	const selected = $derived(context.selectedFile?.path === file.path);
	const open = $derived(context.openFiles.some((f) => f.path === file.path));

	return {
		isDir: false,
		...file,

		get selected() {
			return selected;
		},

		get open() {
			return open;
		},

		select() {
			context.selectedFile = file;
		}
	};
};

const createDirectory = ({ name }: { name: string }): Directory => {
	let open = $state(false);

	return {
		isDir: true,
		name,
		files: [],

		get open() {
			return open;
		},
		set open(o: boolean) {
			open = o;
		}
	};
};

export class FileTree {
	files: (Directory | File)[] = [];

	constructor({ files }: { files: { path: string; name: string; contents: string }[] }) {
		for (const file of files) {
			const dirs = file.path.split('/').slice(0, -1);
			let children = this.files;

			for (const dir of dirs) {
				const existingDir = children.filter((file) => file.isDir).find((file) => file.name === dir);

				if (existingDir) {
					children = existingDir.files;
				} else {
					const newDir = createDirectory({ name: dir });
					children.push(newDir);
					children = newDir.files;
				}
			}

			children.push(createFile({ file }));
		}
	}
}
