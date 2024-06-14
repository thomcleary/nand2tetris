<script lang="ts">
	import Tabs from '../shared/Tabs.svelte';

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

	#editor {
		grid-area: editor;
		display: flex;
		flex-direction: column;
	}
</style>
