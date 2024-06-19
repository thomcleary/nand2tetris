<script lang="ts">
	type TabsProps = {
		tabs: readonly string[];
		onSelectTab?: (tab: string) => void;
		onCloseTab?: (tab: string) => void;
	};

	let { tabs, onSelectTab, onCloseTab }: TabsProps = $props();

	let selectedTab = $state(tabs[0]);

	$effect(() => {
		// Reset selected tab to default if tabs change
		selectedTab = tabs[0];
	});
</script>

<div>
	{#each tabs as tab}
		<div class="tab" class:selected={selectedTab === tab}>
			<button
				class="file-btn"
				style:padding={`0.5rem ${onCloseTab ? '0.5' : '1'}rem 0.5rem 1rem`}
				onclick={() => {
					selectedTab = tab;
					onSelectTab?.(tab);
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
		padding: 0;
		border: none;
	}

	.tab {
		min-width: 10%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-bg-dark);
		color: var(--color-grey);
		font-size: 0.8rem;
		border: none;
	}

	.tab:hover {
		background-color: var(--color-bg-light);
	}

	.selected {
		background-color: var(--color-bg-light);
		border-bottom: 2px solid var(--color-white-bright);
		border-right: 1px solid var(--color-black);
	}

	.selected > button {
		color: var(--color-white-bright);
	}

	.file-btn {
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
