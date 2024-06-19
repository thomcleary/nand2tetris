<script lang="ts">
	import { _$dateTime } from '$lib/runes/_$dateTime.svelte';
	import { _$online } from '$lib/runes/_$online.svelte';
	import WifiIcon from '../../../lib/components/icons/WifiIcon.svelte';
	import SvelteIcon from '../icons/SvelteIcon.svelte';

	let { currentApp }: { currentApp: string | undefined } = $props();

	let dateTime = _$dateTime();
	let online = _$online();
</script>

<header class="menu-bar">
	<div class="menu-bar-items">
		<SvelteIcon height="0.8rem" fill="white" />
		{#if currentApp}
			<b>{currentApp}</b>
		{/if}
	</div>
	<div class="menu-bar-items">
		<WifiIcon height="0.8rem" fill={`rgba(255, 255, 255, ${online() ? '1' : '0.25'})`} />
		<span class="menu-bar-datetime">{dateTime()}</span>
	</div>
</header>

<style>
	b {
		font-weight: 800;
	}

	.menu-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.25rem 1rem;
		background-color: rgba(0, 0, 0, 0.2);
		color: white;
	}

	b,
	.menu-bar span {
		font-size: 0.8rem;
	}

	.menu-bar-items {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.menu-bar-datetime {
		opacity: 0.5;
	}
</style>
