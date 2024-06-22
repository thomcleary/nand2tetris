<script lang="ts">
	import FileIcon from '$lib/components/icons/FileIcon.svelte';
	import GearIcon from '$lib/components/icons/GearIcon.svelte';
	import type { IconProps } from '../../../icons/types';
	import Explorer from './Explorer.svelte';

	let selectedTab = $state<'EXPLORER' | 'SETTINGS' | undefined>('EXPLORER');

	const handleTabClick = (tab: typeof selectedTab) =>
		(selectedTab = tab === selectedTab ? undefined : tab);

	const iconProps = { width: '1.25rem', height: '1.25rem' } as const satisfies IconProps;
</script>

<div class="sidebar">
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
				<Explorer />
			{:else}
				<div class="settings"></div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.sidebar {
		grid-area: explorer;
		display: flex;
		border-right: 1px solid var(--color-grey-border);
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

	.content-heading {
		display: flex;
		align-items: center;
		font-size: 0.6rem;
		color: var(--color-white);
		padding: 0.5rem 3rem 0.5rem 0.75rem;
		text-align: left;
	}

	.content {
		overflow: auto;
	}

	.settings {
		padding: 0.5rem 0rem;
	}
</style>
