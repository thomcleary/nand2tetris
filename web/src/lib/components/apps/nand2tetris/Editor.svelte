<script lang="ts">
	import FileTypeIcon from '$lib/components/icons/FileTypeIcon.svelte';
	import SvelteIcon from '$lib/components/icons/SvelteIcon.svelte';
	import CodeMirror from 'svelte-codemirror-editor';

	import Tabs from './Tabs.svelte';
	import { getNand2TetrisContext } from './context.svelte';

	const context = getNand2TetrisContext();
</script>

{#snippet tabIcon(filename: string)}
	<FileTypeIcon height="1rem" fileType={filename.split('.').pop() ?? ''} />
{/snippet}

<div class="editor">
	{#if context.selectedFile}
		<div class="tabs">
			<Tabs
				tabs={context.openFiles.map((file) => ({ label: file.name, key: file.path }))}
				icon={tabIcon}
				selected={context.selectedFile?.path}
				onSelectTab={(tab) => {
					const file = context.openFiles.find((f) => f.path === tab.key);
					if (file) {
						context.selectedFile = file;
					}
				}}
				onCloseTab={(tab) => {
					const file = context.openFiles.find((f) => f.path === tab.key);
					file && context.closeFile(file);
				}}
			/>
		</div>
		<div class="codemirror-container">
			<CodeMirror
				value={context.selectedFile.contents}
				nodebounce
				on:change={(event) => {
					if (context.selectedFile) {
						context.selectedFile.contents = event.detail;
					}
				}}
				styles={{
					'& *': {
						fontFamily: 'var(--font-code)',
						fontSize: '16px'
					},
					'&': {
						backgroundColor: 'var(--color-bg-light)'
					},
					'& .cm-line': {
						color: 'var(--color-white)'
					},
					'& .cm-gutters': {
						backgroundColor: 'var(--color-bg-light)',
						color: 'var(--color-grey-border)',
						border: 'none'
					},
					'& .cm-gutterElement.cm-activeLineGutter': {
						backgroundColor: 'var(--color-bg-light)',
						color: 'var(--color-white)'
					},
					'&.cm-focused .cm-cursor': {
						borderLeft: '2px solid rgb(48, 102, 216)'
					},
					'& .cm-activeLine': {
						background: 'rgb(45, 49, 59)'
					}
				}}
			/>
		</div>
	{:else}
		<div class="default-view">
			<SvelteIcon width="25%" fillOut="rgba(0, 0, 0, 0.3)" fillIn="var(--color-bg-light)" />
		</div>
	{/if}
</div>

<style>
	.editor {
		grid-area: editor;
		display: flex;
		flex-direction: column;
		overflow: auto;
	}

	.codemirror-container {
		flex: 1;
		display: grid;
		grid-template-rows: 1fr;
		background-color: var(--color-bg-light);
		padding-top: 0.5rem;
		overflow: auto;
	}

	.default-view {
		flex: 1;
		display: grid;
		place-items: center;
	}
</style>
