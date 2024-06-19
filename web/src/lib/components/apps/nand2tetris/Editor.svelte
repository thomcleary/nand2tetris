<script lang="ts">
	import { getNand2TetrisContext } from './Nand2Tetris.svelte';

	const context = getNand2TetrisContext();
</script>

{#if context.selectedFile}
	<textarea
		spellcheck="false"
		value={context.selectedFile?.contents}
		oninput={({ currentTarget: { value } }) => {
			if (context.selectedFile?.contents) {
				context.selectedFile.contents = value;
			}
		}}
	></textarea>
{:else}
	<div>No file selected</div>
{/if}

<style>
	div {
		color: white;
	}

	textarea {
		flex: 1;
		font-family: var(--font-code);
		background-color: var(--color-bg-light);
		color: var(--color-white);
		margin: 0;
		padding: 1rem;
		border: none;
		outline: none;
		resize: none;
		text-wrap: nowrap;
	}
</style>
