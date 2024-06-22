<script lang="ts" generics="T extends string">
	import type { Snippet } from 'svelte';

	type Tab<T> = { label: T; key: string };

	type TabsProps<T> = {
		tabs: Tab<T>[];
		icon?: Snippet<[string]>;
		selected?: string;
		onSelectTab?: (tab: Tab<T>) => void;
		onCloseTab?: (tab: Tab<T>) => void;
	};

	// ESLint complaining T is not defined
	// eslint-disable-next-line no-undef
	let { tabs, icon, selected, onSelectTab, onCloseTab }: TabsProps<T> = $props();
</script>

<div class="tabs">
	{#each tabs as tab}
		<div class="tab" class:selected={selected === tab.key}>
			<button
				class="tab-btn"
				style:padding={`0.5rem ${onCloseTab ? '0.5' : '1'}rem 0.5rem 1rem`}
				onclick={() => {
					onSelectTab?.(tab);
				}}
			>
				{#if icon}
					{@render icon(tab.label)}
				{/if}
				{tab.label}</button
			>{#if onCloseTab}
				<button onclick={() => onCloseTab(tab)} class="close-btn">x</button>
			{/if}
		</div>
	{/each}
</div>

<style>
	::-webkit-scrollbar {
		width: 4px;
		height: 4px;
	}

	div {
		display: flex;
		justify-content: flex-start;
		text-wrap: nowrap;
	}

	button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background-color: transparent;
		color: var(--color-grey);
		padding: 0;
		border: none;
	}

	.tabs {
		overflow: auto;
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

	.selected > .close-btn:hover {
		background-color: rgb(51, 56, 65);
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
		background-color: var(--color-bg-light);
	}
</style>
