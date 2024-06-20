<script lang="ts">
	import ChevronIcon from '$lib/components/icons/ChevronIcon.svelte';
	import FileTypeIcon from '$lib/components/icons/FileTypeIcon.svelte';
	import { getFinder } from '$lib/contexts/finder.svelte';
	import FolderIcon from '../../icons/FolderIcon.svelte';
	import { FileTree, type Directory, type File } from './FileTree.svelte';

	const finder = getFinder();
	const fileTree = new FileTree({ files: finder.files });

	let open = $state(true);

	const dirSpacing = (depth: number) => (1.5 + 1 * depth) / 2;
	const fileSpacing = (depth: number) => dirSpacing(depth - 1) / 2 + 1.25;

	const dirPadding = (depth: number) =>
		`0.4rem ${dirSpacing(depth) * 2}rem 0.4rem ${dirSpacing(depth)}rem`;

	const filePadding = (depth: number) =>
		`0.4rem ${fileSpacing(depth) * 2}rem 0.4rem ${fileSpacing(depth)}rem`;
</script>

{#snippet filesSnippet({files, depth}: {files: typeof fileTree.files; depth: number})}
	<ul>
		{#each files as file}
			<li>
				{#if file.isDir}
					{@render directorySnippet({ dir: file, depth })}
				{:else}
					{@render fileSnippet({ file, depth })}
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

{#snippet fileSnippet({file, depth}: {file: File, depth: number})}
	<button
		style:padding={filePadding(depth)}
		class:selected={file.selected}
		onclick={() => file.select()}
		><FileTypeIcon
			width="0.8rem"
			height="0.8rem"
			fileType={file.name.split('.').pop() ?? ''}
		/>{file.name}</button
	>
{/snippet}

{#snippet directorySnippet({dir, depth}: {dir: Directory, depth: number})}
	<button style:padding={dirPadding(depth)} onclick={() => (dir.open = !dir.open)}
		><ChevronIcon
			width="0.6rem"
			height="0.6rem"
			fill="var(--color-white)"
			direction={dir.open ? 'down' : 'right'}
		/><FolderIcon
			open={dir.open}
			width="0.8rem"
			height="0.8rem"
			fill="rgb(148, 164, 173)"
		/>{dir.name}</button
	>
	{#if dir.open}
		{@render filesSnippet({ files: dir.files, depth: depth + 1 })}
	{/if}
{/snippet}

<button class="toggle" onclick={() => (open = !open)}
	><ChevronIcon
		width="0.8rem"
		height="0.8rem"
		fill="var(--color-white)"
		direction={open ? 'down' : 'right'}
	/>nand2tetris</button
>
{#if open}
	{@render filesSnippet({ files: fileTree.files, depth: 0 })}
{/if}

<style>
	ul {
		display: flex;
		flex-direction: column;
		margin: 0;
		padding: 0;
		list-style-type: none;
		text-wrap: nowrap;
	}

	li {
		width: 100%;
	}

	button {
		width: 100%;
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.8rem;
		background-color: transparent;
		color: rgb(162, 168, 180);
		border: none;
	}

	button:hover,
	.selected {
		background-color: rgb(51, 56, 65);
		color: var(--color-white-brightest);
		cursor: pointer;
	}

	.toggle {
		font-weight: 600;
		background-color: rgb(36, 39, 46);
		padding: 0.5rem 0.25rem;
	}
</style>
