<script lang="ts">
	import { getNand2TetrisContext } from './Nand2Tetris.svelte';
	import Tabs from './Tabs.svelte';

	const context = getNand2TetrisContext();
</script>

<div class="editor">
	{#if context.selectedFile}
		<Tabs
			tabs={[context.selectedFile.name]}
			onCloseTab={() => {
				context.selectedFile = undefined;
			}}
		/>
		<textarea
			spellcheck="false"
			value={context.selectedFile?.contents}
			oninput={({ currentTarget: { value } }) => {
				if (context.selectedFile) {
					context.selectedFile.contents = value;
				}
			}}
		></textarea>
	{:else}
		<div>No file selected</div>
	{/if}
</div>

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
		resize: none;
		text-wrap: nowrap;
	}

	textarea:focus {
		outline: none;
	}

	.editor {
		grid-area: editor;
		display: flex;
		flex-direction: column;
		border-left: 1px solid var(--color-grey-border);
	}
</style>
