<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
	import '../app.css';

	const { children } = $props();

	let visible = $state(false);
	setTimeout(() => (visible = true));
</script>

{#if visible}
	<div id="code-window" in:scale={{ easing: quintOut, duration: 1000 }}>
		{@render children()}
	</div>
{/if}

<style>
	:global(body) {
		height: 100dvh;
		width: 100dvw;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0;
		/* https://cssgradient.io/ **/
		background: rgb(131, 58, 180);
		background: linear-gradient(
			45deg,
			rgba(131, 58, 180, 1) 0%,
			rgba(253, 29, 29, 1) 50%,
			rgba(252, 176, 69, 1) 100%
		);
	}

	#code-window {
		flex: 1;
		display: flex;
		flex-direction: column;
		height: 90%;
		max-width: min(95%, 2560px);
		background-color: var(--color-bg-dark);
		border: 2px solid var(--color-grey-border);
		border-radius: 1rem;
		/* https://shadows.brumm.af **/
		box-shadow:
			2.8px 2.8px 2.2px rgba(0, 0, 0, 0.059),
			6.7px 6.7px 5.3px rgba(0, 0, 0, 0.085),
			12.5px 12.5px 10px rgba(0, 0, 0, 0.105),
			22.3px 22.3px 17.9px rgba(0, 0, 0, 0.125),
			41.8px 41.8px 33.4px rgba(0, 0, 0, 0.151),
			100px 100px 80px rgba(0, 0, 0, 0.21);
	}
</style>
