<script lang="ts" generics="T extends string">
	import type { ComponentProps } from 'svelte';
	import FileTree from './FileTree.svelte';

	type ExplorerProps = Pick<ComponentProps<FileTree>, 'files' | 'onSelectFile'> & {};

	const { files, onSelectFile }: ExplorerProps = $props();

	let selectedTab = $state<'EXPLORER' | 'SEARCH' | 'SETTINGS' | undefined>('EXPLORER');

	const handleTabClick = (tab: typeof selectedTab) =>
		(selectedTab = tab === selectedTab ? undefined : tab);
</script>

<div id="explorer">
	<div id="explorer-tabs">
		<div class="tab-buttons">
			<button class:selected={selectedTab === 'EXPLORER'} onclick={() => handleTabClick('EXPLORER')}
				>📑</button
			>
			<button class:selected={selectedTab === 'SEARCH'} onclick={() => handleTabClick('SEARCH')}
				>🔍</button
			>
		</div>
		<div class="tab-buttons">
			<button class:selected={selectedTab === 'SETTINGS'} onclick={() => handleTabClick('SETTINGS')}
				>⚙️</button
			>
		</div>
	</div>

	{#if !!selectedTab}
		<div id="explorer-content">
			<div id="explorer-heading">{selectedTab}</div>
			{#if selectedTab === 'EXPLORER'}
				<span id="file-tree-options">NAND2TETRIS</span>
				<div style:padding-left="0.5rem">
					<FileTree {files} {onSelectFile} />
				</div>
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
		color: var(--color-grey);
		padding: 0.5rem;
		border: none;
		border-left: 2px solid transparent;
		cursor: pointer;
	}

	button:hover {
		color: var(--color-white-bright);
	}

	input {
		font-family: var(--font-system);
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
		color: var(--color-white-bright);
		border-left: 2px solid var(--color-white-bright);
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
		font-family: var(--font-system);
		font-size: 0.6rem;
		color: var(--color-white);
		padding: 0.5rem 3rem 0.5rem 1rem;
		text-align: left;
	}

	#file-tree-options {
		width: 100%;
		font-family: var(--font-system);
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
