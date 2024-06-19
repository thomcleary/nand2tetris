<script lang="ts">
	import { getFinder } from '$lib/contexts/finder.svelte';
	import { getNand2TetrisContext } from './Nand2Tetris.svelte';

	const context = getNand2TetrisContext();
	const finder = getFinder();
</script>

<div class="explorer">
	<ul>
		{#each finder.files as file}
			<li><button onclick={() => (context.selectedFile = file)}>{file.path}</button></li>
		{/each}
	</ul>
</div>

<style>
	ul {
		list-style: none;
		margin: 0;
		padding: 1rem;
	}

	li {
		color: white;
		padding: 1rem;
	}

	.explorer {
		grid-area: explorer;
	}
</style>
