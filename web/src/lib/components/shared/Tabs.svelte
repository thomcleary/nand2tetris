<script lang="ts">
	type TabsProps = {
		tabs: readonly string[];
		onSelectTab?: (tab: string) => void;
	};

	const { tabs, onSelectTab }: TabsProps = $props();

	let selectedTab = $state(tabs[0]);
</script>

<div class="tabs">
	{#each tabs as tab}
		<button
			class="tab"
			class:tab-selected={selectedTab === tab}
			onclick={() => {
				selectedTab = tab;
				onSelectTab?.(tab);
			}}>{tab}</button
		>
	{/each}
</div>

<style>
	button {
		background-color: transparent;
		color: var(--color-white);
		border: none;
	}

	.tabs {
		display: flex;
		justify-content: flex-start;
		text-wrap: nowrap;
	}

	.tab {
		min-width: 10%;
		font-family: var(--font-system);
		font-size: 0.8rem;
		background-color: var(--color-bg-dark);
		color: var(--color-grey);
		padding: 0.5rem 1rem;
	}

	.tab:hover {
		cursor: pointer;
	}

	.tab-selected {
		background-color: var(--color-bg-light);
		color: var(--color-white-bright);
		border-bottom: 2px solid var(--color-white-bright);
		border-right: 1px solid var(--color-black);
	}
</style>
