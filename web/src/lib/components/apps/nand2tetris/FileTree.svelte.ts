import { getNand2TetrisContext } from './Nand2Tetris.svelte';

type _FileDetails = { path: string; name: string; contents: string };
export type File = { isDir: false; name: string; selected: boolean; select: () => void };
export type Directory = { isDir: true; name: string; files: (Directory | File)[]; open: boolean };

const createFile = ({ file }: { file: _FileDetails }): File => {
	const context = getNand2TetrisContext();
	const selected = $derived(context.selectedFile?.path === file.path);

	return {
		isDir: false,
		...file,

		get selected() {
			return selected;
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
				const existingDir = children.find(
					(file): file is Directory => file.isDir && file.name === dir
				);

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
