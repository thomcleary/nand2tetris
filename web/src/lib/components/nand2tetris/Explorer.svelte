<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import FileIcon from '../icons/FileIcon.svelte';
	import GearIcon from '../icons/GearIcon.svelte';
	import MagnifyingGlassIcon from '../icons/MagnifyingGlassIcon.svelte';
	import type { IconProps } from '../icons/types';
	import FileTree from './FileTree.svelte';

	type ExplorerProps = Pick<ComponentProps<FileTree>, 'files' | 'onSelectFile'> & {};

	const { files, onSelectFile }: ExplorerProps = $props();

	let selectedTab = $state<'EXPLORER' | 'SEARCH' | 'SETTINGS' | undefined>('EXPLORER');

	const handleTabClick = (tab: typeof selectedTab) =>
		(selectedTab = tab === selectedTab ? undefined : tab);

	const iconProps = { width: '1.25rem', height: '1.25rem' } as const satisfies IconProps;
</script>

<div id="explorer">
	<div id="explorer-tabs">
		<div class="tab-buttons">
			<button class:selected={selectedTab === 'EXPLORER'} onclick={() => handleTabClick('EXPLORER')}
				><FileIcon {...iconProps} /></button
			>
			<button class:selected={selectedTab === 'SEARCH'} onclick={() => handleTabClick('SEARCH')}
				><MagnifyingGlassIcon {...iconProps} /></button
			>
		</div>
		<div class="tab-buttons">
			<button class:selected={selectedTab === 'SETTINGS'} onclick={() => handleTabClick('SETTINGS')}
				><GearIcon {...iconProps} /></button
			>
		</div>
	</div>

	{#if !!selectedTab}
		<div id="explorer-content">
			<div id="explorer-heading">{selectedTab}</div>
			{#if selectedTab === 'EXPLORER'}
				<span id="file-tree-options">NAND2TETRIS</span>
				<FileTree {files} {onSelectFile} />
			{:else if selectedTab === 'SEARCH'}
				<input placeholder="Search" />
			{/if}
		</div>
	{/if}
</div>

<style>
	button {
		font-size: 1rem;
		background-color: transparent;
		fill: var(--color-grey);
		padding: 0.75rem;
		border: none;
		border-left: 2px solid transparent;
		cursor: pointer;
	}

	button:hover {
		fill: var(--color-white-brightest);
	}

	input {
		font-size: 0.8rem;
		background-color: rgb(29, 31, 35);
		color: var(--color-white);
		margin: 0.5rem;
		padding: 0.5rem;
		border: 1px solid transparent;
		border-radius: 0.25rem;
	}

	input:focus {
		border: 1px solid var(--color-grey-border);
		outline: none;
	}

	.selected {
		fill: var(--color-white-brightest);
		border-left: 2px solid var(--color-white-brightest);
	}

	.tab-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	#explorer {
		grid-area: explorer;
		display: flex;
		color: var(--color-white);
	}

	#explorer-tabs {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		background-color: var(--color-bg-light);
	}

	#explorer-content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	#explorer-heading {
		display: flex;
		align-items: center;
		font-size: 0.6rem;
		color: var(--color-white);
		padding: 0.5rem 3rem 0.5rem 1rem;
		text-align: left;
	}

	#file-tree-options {
		width: 100%;
		font-weight: 600;
		font-size: 0.6rem;
		background-color: var(--color-bg-light);
		color: var(--color-white);
		padding: 0.5rem;
		border: none;
		text-align: left;
		text-wrap: nowrap;
	}
</style>
