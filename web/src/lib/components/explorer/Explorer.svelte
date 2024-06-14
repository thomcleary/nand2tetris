<script lang="ts" generics="T extends string">
	import type { ComponentProps } from 'svelte';
	import FileTree from './FileTree.svelte';

	type ExplorerProps = Pick<ComponentProps<FileTree>, 'files' | 'onSelectFile'> & {};

	const { files, onSelectFile }: ExplorerProps = $props();
</script>

<div id="explorer">
	<FileTree {files} {onSelectFile} />
</div>

<style>
	#explorer {
		grid-area: explorer;
		color: var(--color-white);
	}
</style>
