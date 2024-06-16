<script lang="ts" context="module">
	export class File {
		name: string;

		constructor({ name }: { name: string }) {
			this.name = name;
		}
	}

	export class Directory {
		name: string;
		files: File[];
		open = $state(false);

		constructor({ name, files }: { name: string; files: File[] }) {
			this.name = name;
			this.files = files;
		}
	}
</script>

<script lang="ts">
	import ChevronIcon from '../icons/ChevronIcon.svelte';
	import FolderIcon from '../icons/FolderIcon.svelte';
	type FileTreeProps = {
		files: readonly (File | Directory)[];
		onSelectFile?: (fileName: File['name']) => void;
		depth?: number;
	};

	const { files, onSelectFile, depth = 0 }: FileTreeProps = $props();

	const spacing = 0.5 + 1 * depth;
</script>

<ul>
	{#each files as file}
		<li>
			{#if file instanceof Directory}
				<button
					style:padding-left={`${spacing / 2}rem`}
					style:padding-bottom="0.4rem"
					onclick={() => (file.open = !file.open)}
					><ChevronIcon
						width="0.6rem"
						height="0.6rem"
						fill="var(--color-white)"
						direction={file.open ? 'down' : 'right'}
					/><FolderIcon
						open={file.open}
						width="0.6rem"
						height="0.6rem"
						fill="rgb(148, 164, 173)"
					/>{file.name}</button
				>
				{#if file.open}
					<svelte:self {onSelectFile} files={file.files} depth={depth + 1} />
				{/if}
			{:else}
				<button style:padding-left={`${spacing}rem`} onclick={() => onSelectFile?.(file.name)}
					>{file.name}</button
				>
			{/if}
		</li>
	{/each}
</ul>

<style>
	ul {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin: 0;
		padding: 0;
		list-style-type: none;
		text-wrap: nowrap;
	}

	button {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-family: var(--font-system);
		font-size: 0.8rem;
		background-color: transparent;
		color: var(--color-white);
		border: none;
	}

	button:hover {
		cursor: pointer;
	}
</style>
