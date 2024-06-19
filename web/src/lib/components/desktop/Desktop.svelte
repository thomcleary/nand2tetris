<script lang="ts">
	import appleTouchLogo from '$lib/assets/images/apple-touch-icon.png';
	import { fade } from 'svelte/transition';
	import Nand2Tetris from '../apps/nand2tetris/Nand2Tetris.svelte';

	let {
		onOpenApp,
		onCloseApp
	}: {
		onOpenApp?: (app: string) => void;
		onCloseApp?: (app: string) => void;
	} = $props();

	let open = $state(false);

	const handleClose = () => {
		open = false;
		onCloseApp?.('nand2tetris');
	};
</script>

<main>
	{#if open}
		<Nand2Tetris onClose={handleClose} onMinimise={handleClose} />
	{:else}
		<button
			in:fade={{ duration: 250 }}
			onclick={() => {
				open = true;
				onOpenApp?.('nand2tetris');
			}}
		>
			<img src={appleTouchLogo} height={64} width={64} alt="nand2tetris" />
			nand2tetris
		</button>
	{/if}
</main>

<style>
	main {
		display: grid;
		grid-template: 1fr / 1fr;
		align-items: center;
		justify-items: center;
	}

	button {
		/* height: 4rem; */
		/* width: 4rem; */
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		background-color: transparent;
		color: white;
		padding: 0;
		border: none;
		border-radius: 1rem;
	}

	img {
		background-color: rgba(0, 0, 0, 0.3);
		padding: 0.25rem 0.25rem 0.5rem 0.25rem;
		border-radius: 1rem;
	}
</style>
