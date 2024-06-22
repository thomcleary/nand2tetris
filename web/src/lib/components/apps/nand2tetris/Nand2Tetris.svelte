<script lang="ts" context="module">
	import type { File } from '$lib/types';

	export type Nand2TetrisContext = {
		openFiles: File[];
		selectedFile: File | undefined;
		closeFile: (file: File) => void;
	};

	const contextKey = 'nand2tetris';

	const setNand2TetrisContext = () => {
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
</script>

<script lang="ts">
	import { getContext, setContext, type ComponentProps } from 'svelte';
	import Window from '../Window.svelte';
	import Editor from './Editor.svelte';
	import Footer from './Footer.svelte';
	import Output from './Output.svelte';
	import Sidebar from './Sidebar.svelte';

	let {
		...windowProps
	}: Pick<ComponentProps<Window>, 'onClose' | 'onMinimise' | 'onMaximise'> = $props();

	const context = setNand2TetrisContext();
</script>

<Window {...windowProps}>
	{#snippet headerCenter()}
		<a class="header-link" href="https://www.nand2tetris.org/" target="_blank" rel="noreferrer"
			>nand2tetris</a
		>
	{/snippet}
	<div
		class="nand2tetris"
		style:grid-template-columns={context.selectedFile ? '' : 'min-content 1fr'}
		style:grid-template-rows={context.selectedFile ? '' : '1fr min-content'}
	>
		<Sidebar />
		<Editor />
		<Output />
		<Footer />
	</div>
</Window>

<style>
	.header-link {
		font-size: 0.8rem;
		background-color: rgb(47, 50, 57);
		color: rgb(108, 113, 124);
		margin: 0.4rem;
		padding: 0.2rem;
		border: 1px solid rgb(55, 58, 65);
		border-radius: 0.25rem;
		text-align: center;
		text-decoration: none;
	}

	.header-link:hover {
		color: rgb(159, 165, 179);
		border: 1px solid rgb(69, 73, 80);
	}

	.nand2tetris {
		min-height: 100%; /* This was very important to make the window height work on landscape mobile 🙃 */
		display: grid;
		grid-template-columns: min-content 4fr 3fr;
		grid-template-rows: 1fr min-content;
		grid-template-areas:
			'explorer editor output'
			'footer footer footer';
	}

	@media (width <= 1280px) {
		.nand2tetris {
			grid-template-columns: min-content 1fr;
			grid-template-rows: 3fr 2fr min-content;
			grid-template-areas:
				'explorer editor'
				'explorer output'
				'footer footer';
		}
	}
</style>
