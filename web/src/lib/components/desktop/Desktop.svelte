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
</script>

<main>
	{#if open}
		<Nand2Tetris
			onClose={() => {
				open = false;
				onCloseApp?.('nand2tetris');
			}}
		/>
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
		justify-self: center;
		align-self: center;
	}
</style>
