<script lang="ts">
	import FileIcon from '$lib/components/icons/FileIcon.svelte';
	import GearIcon from '$lib/components/icons/GearIcon.svelte';
	import { getFinder } from '$lib/contexts/finder.svelte';
	import type { IconProps } from '../../icons/types';
	import { getNand2TetrisContext } from './Nand2Tetris.svelte';

	const context = getNand2TetrisContext();
	const finder = getFinder();

	let selectedTab = $state<'EXPLORER' | 'SETTINGS' | undefined>('EXPLORER');

	const handleTabClick = (tab: typeof selectedTab) =>
		(selectedTab = tab === selectedTab ? undefined : tab);

	const iconProps = { width: '1.25rem', height: '1.25rem' } as const satisfies IconProps;

	$inspect(selectedTab);
</script>

<div class="explorer">
	<div class="tabs">
		<div class="tab-btns">
			<button class:selected={selectedTab === 'EXPLORER'} onclick={() => handleTabClick('EXPLORER')}
				><FileIcon {...iconProps} /></button
			>
		</div>
		<div class="tab-btns">
			<button class:selected={selectedTab === 'SETTINGS'} onclick={() => handleTabClick('SETTINGS')}
				><GearIcon {...iconProps} /></button
			>
		</div>
	</div>
	{#if selectedTab}
		<div class="content">
			<div class="content-heading">{selectedTab}</div>
			{#if selectedTab === 'EXPLORER'}
				<ul>
					{#each finder.files as file}
						<li><button onclick={() => (context.selectedFile = file)}>{file.path}</button></li>
					{/each}
				</ul>
			{:else}
				<div class="settings">
					<label for="settings-todo"
						><input type="checkbox" id="settings-todo" name="settings-todo" />settings todo</label
					>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li {
		padding: 0.5rem 0rem;
	}

	li > button {
		color: var(--color-white);
		background-color: transparent;
		font-size: 0.8rem;
		padding: 0;
		border: none;
	}

	label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--color-grey);
		text-wrap: nowrap;
	}

	input {
		margin: 0;
	}

	.explorer {
		grid-area: explorer;
		display: flex;
	}

	.tabs {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		background-color: var(--color-bg-light);
	}

	.tab-btns {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.tab-btns > button {
		font-size: 1rem;
		background-color: transparent;
		fill: var(--color-grey);
		padding: 0.75rem;
		border: none;
		border-left: 2px solid transparent;
		cursor: pointer;
	}

	.tab-btns > button.selected {
		fill: var(--color-white-brightest);
		border-left: 2px solid var(--color-white-brightest);
	}

	.tab-btns > button:hover {
		fill: var(--color-white-brightest);
	}

	.content {
		padding: 0.5rem 1rem;
	}

	.content-heading {
		display: flex;
		align-items: center;
		font-size: 0.6rem;
		color: var(--color-white);
		padding-right: 3rem;
		text-align: left;
	}

	.settings {
		padding: 0.5rem 0rem;
	}
</style>
