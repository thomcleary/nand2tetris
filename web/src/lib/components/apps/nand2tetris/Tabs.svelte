<script lang="ts">
	type TabsProps = {
		tabs: readonly string[];
		selected?: string;
		onCloseTab?: (tab: string) => void;
	};

	let { tabs, selected = $bindable(), onCloseTab }: TabsProps = $props();

	$effect(() => {
		selected = tabs[0];
	});
</script>

<div>
	{#each tabs as tab}
		<div class="tab" class:selected={selected === tab}>
			<button
				class="tab-btn"
				style:padding={`0.5rem ${onCloseTab ? '0.5' : '1'}rem 0.5rem 1rem`}
				onclick={() => {
					selected = tab;
				}}>{tab}</button
			>{#if onCloseTab}
				<button onclick={() => onCloseTab(tab)} class="close-btn">x</button>
			{/if}
		</div>
	{/each}
</div>

<style>
	div {
		display: flex;
		justify-content: flex-start;
		text-wrap: nowrap;
	}

	button {
		background-color: transparent;
		color: var(--color-grey);
		padding: 0;
		border: none;
	}

	.tab {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-bg-dark);
	}

	.tab:hover {
		background-color: rgb(51, 56, 65);
	}

	.tab > button {
		font-size: 0.8rem;
	}

	.selected {
		background-color: var(--color-bg-light);
		border-bottom: 2px solid var(--color-white-bright);
		border-right: 1px solid var(--color-black);
	}

	.selected:hover {
		background-color: var(--color-bg-light);
	}

	.selected > button {
		color: var(--color-white-bright);
	}

	.tab-btn {
		flex: 1;
	}

	.close-btn {
		margin-right: 0.25rem;
		padding: 0.25rem 0.5rem;
		border-radius: 0.4rem;
	}

	.close-btn:hover {
		background-color: rgb(51, 56, 65);
	}
</style>
