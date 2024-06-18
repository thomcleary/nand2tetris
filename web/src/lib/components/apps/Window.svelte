<script lang="ts">
	import { _$online } from '$lib/runes/_$online.svelte';
	import type { Snippet } from 'svelte';
	import { quintInOut, quintOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';

	const colours = {
		red: '#EC695E',
		yellow: '#F5BE4F',
		green: '#60C253'
	} as const satisfies Record<string, `#${string}`>;

	let {
		onClose,
		onMinimise,
		onMaximise,
		headerCenter,
		headerRight,
		children
	}: {
		onClose?: () => void;
		onMinimise?: () => void;
		onMaximise?: () => void;
		headerCenter?: Snippet;
		headerRight?: Snippet;
		children: Snippet;
	} = $props();

	let show = $state(false);
	$effect(() => {
		show = true;
	});

	let fullscreen = $state(false);

	let outroType = $state<'close' | 'minimise'>();
	let outroDuration = $derived(outroType === 'close' ? 0 : 750);
</script>

{#snippet circle({colour, onClick}: {colour: keyof typeof colours, onClick: (() => void) | undefined})}
	<button class="window-button" onclick={onClick}>
		<svg fill={colours[colour]} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" />
		</svg>
	</button>
{/snippet}

{#if show}
	<div
		class="window"
		class:fullscreen
		in:scale={{ easing: quintOut, duration: 1000, opacity: 0.5 }}
		out:scale={{ easing: quintInOut, duration: outroDuration, opacity: 0.5 }}
		onoutroend={() => (outroType === 'close' ? onClose?.() : onMinimise?.())}
	>
		<header>
			<div class="window-buttons">
				{@render circle({
					colour: 'red',
					onClick: () => {
						outroType = 'close';
						show = false;
					}
				})}
				{@render circle({
					colour: 'yellow',
					onClick: () => {
						outroType = 'minimise';
						show = false;
					}
				})}
				{@render circle({
					colour: 'green',
					onClick: () => {
						fullscreen = !fullscreen;
						onMaximise?.();
					}
				})}
			</div>
			{@render headerCenter?.()}
			{@render headerRight?.()}
		</header>
		{@render children()}
	</div>
{/if}

<style>
	header {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		align-items: center;
		border-top-left-radius: 0.75rem;
		border-top-right-radius: 0.75rem;
	}

	.window {
		display: grid;
		grid-template: min-content 1fr / 1fr;
		height: 90%;
		width: min(95%, 2560px);
		background-color: var(--bg-color, var(--color-bg-dark));
		border: 2px solid var(--border-color, var(--color-grey-border));
		border-radius: 0.75rem;
		/* https://shadows.brumm.af **/
		box-shadow:
			2.8px 2.8px 2.2px rgba(0, 0, 0, 0.059),
			6.7px 6.7px 5.3px rgba(0, 0, 0, 0.085),
			12.5px 12.5px 10px rgba(0, 0, 0, 0.105),
			22.3px 22.3px 17.9px rgba(0, 0, 0, 0.125),
			41.8px 41.8px 33.4px rgba(0, 0, 0, 0.151),
			100px 100px 80px rgba(0, 0, 0, 0.21);
		transition:
			height 0.2s,
			width 0.2s;
	}

	.fullscreen {
		height: 100%;
		width: 100%;
	}

	.window-buttons {
		height: 2rem;
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding-left: 0.8rem;
	}

	.window-button {
		padding: 0;
		border: 0;
		background-color: transparent;
	}

	.window-button > svg {
		width: 0.8rem;
		overflow: visible;
	}
</style>
