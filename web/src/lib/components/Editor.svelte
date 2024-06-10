<script lang="ts">
	type EditorProps = {
		fileContents: string;
		onInput?: (value: string) => void;
	};

	const { fileContents, onInput }: EditorProps = $props();
</script>

<div id="editor">
	<div class="tabs"><div class="tab tab-selected">Test.jack</div></div>
	<textarea
		spellcheck="false"
		value={fileContents}
		oninput={({ currentTarget: { value } }) => {
			onInput?.(value);
		}}
	></textarea>
</div>

<style>
	/* TODO: don't duplicate textarea styles (see Output component)*/
	textarea {
		flex: 1;
		min-height: 24ch;
		background-color: var(--color-bg-light);
		color: var(--color-white);
		margin: 0;
		padding: 1rem;
		border: none;
		resize: none;
	}

	textarea:focus {
		outline: none;
	}

	/* TODO: don't duplicate tabs (see Output component)*/
	.tabs {
		display: flex;
		justify-content: flex-start;
		text-wrap: nowrap;
	}

	.tab {
		min-width: 10%;
		font-family: var(--font-system);
		font-size: 1rem;
		background-color: var(--color-bg-dark);
		color: var(--color-grey);
		padding: 0.5rem 1rem;
	}

	.tab-selected {
		background-color: var(--color-bg-light);
		color: var(--color-white-bright);
		border-bottom: 2px solid var(--color-white-bright);
		border-right: 1px solid var(--color-black);
	}

	#editor {
		grid-area: editor;
		display: flex;
		flex-direction: column;
	}
</style>
