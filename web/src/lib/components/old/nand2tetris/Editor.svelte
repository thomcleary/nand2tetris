<script lang="ts">
	import Tabs from './Tabs.svelte';

	type EditorProps = {
		fileContents: string;
		onInput?: (value: string) => void;
	};

	const { fileContents, onInput }: EditorProps = $props();
</script>

<div id="editor">
	<Tabs tabs={['TodoTabs.jack']} />
	<textarea
		spellcheck="false"
		value={fileContents}
		oninput={({ currentTarget: { value } }) => {
			onInput?.(value);
		}}
	></textarea>
</div>

<style>
	textarea {
		flex: 1;
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

	#editor {
		grid-area: editor;
		min-width: 0;
		display: flex;
		flex-direction: column;
		border-left: 1px solid var(--color-grey-border);
	}
</style>
