<script lang="ts">
	type TabsProps = {
		tabs: readonly string[];
		onSelectTab?: (tab: string) => void;
	};

	const { tabs, onSelectTab }: TabsProps = $props();

	let selectedTab = $state(tabs[0]);
</script>

<div>
	{#each tabs as tab}
		<button
			class:selected={selectedTab === tab}
			onclick={() => {
				selectedTab = tab;
				onSelectTab?.(tab);
			}}>{tab}</button
		>
	{/each}
</div>

<style>
	div {
		display: flex;
		justify-content: flex-start;
		text-wrap: nowrap;
	}

	button {
		min-width: 10%;
		background-color: var(--color-bg-dark);
		color: var(--color-grey);
		font-size: 0.8rem;
		padding: 0.5rem 1rem;
		border: none;
	}

	button:hover {
		background-color: rgb(51, 56, 65);
		cursor: pointer;
	}

	.selected {
		background-color: var(--color-bg-light);
		color: var(--color-white-bright);
		border-bottom: 2px solid var(--color-white-bright);
		border-right: 1px solid var(--color-black);
	}

	.selected:hover {
		background-color: var(--color-bg-light);
	}
</style>
