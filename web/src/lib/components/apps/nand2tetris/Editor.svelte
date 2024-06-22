<script lang="ts">
	import FileTypeIcon from '$lib/components/icons/FileTypeIcon.svelte';
	import SvelteIcon from '$lib/components/icons/SvelteIcon.svelte';

	import Tabs from './Tabs.svelte';
	import { getNand2TetrisContext } from './context.svelte';

	const context = getNand2TetrisContext();
</script>

{#snippet tabIcon(filename: string)}
	<FileTypeIcon height="1rem" fileType={filename.split('.').pop() ?? ''} />
{/snippet}

<div class="editor">
	{#if context.selectedFile}
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
		<div class="default-view">
			<SvelteIcon width="25%" fillOut="rgba(0, 0, 0, 0.3)" fillIn="var(--color-bg-light)" />
		</div>
	{/if}
</div>

<style>
	div {
		color: white;
	}

	textarea {
		flex: 1;
		font-family: var(--font-code);
		font-size: 16px; /* Mobile zoom's in on focus if less than 16px */
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
		overflow: auto;
	}

	.default-view {
		flex: 1;
		display: grid;
		place-items: center;
	}
</style>
