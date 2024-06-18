<script lang="ts">
	import Nand2Tetris from '../apps/nand2tetris/Nand2Tetris.svelte';
	import TPieceIcon from '../icons/TPieceIcon.svelte';

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
			onclick={() => {
				open = true;
				onOpenApp?.('nand2tetris');
			}}
		>
			<TPieceIcon />
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
		height: 4rem;
		width: 4rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		font-family: Arial, Helvetica, sans-serif;
		background-color: transparent;
		color: white;
		padding: 0;
		border: none;
		border-radius: 1rem;
		cursor: pointer;
	}
</style>
