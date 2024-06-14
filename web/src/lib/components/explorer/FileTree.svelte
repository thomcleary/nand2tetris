<script lang="ts" context="module">
	export type File =
		| { type: 'directory'; name: string; children: File[] }
		| { type: 'file'; name: string };
</script>

<script lang="ts">
	type FileTreeProps = {
		files: readonly File[];
		onSelectFile?: (fileName: File['name']) => void;
		depth?: number;
	};

	const { files, onSelectFile, depth = 0 }: FileTreeProps = $props();

	let open = $state(false);

	const spacing = 0.5 + 0.5 * depth;
</script>

<ul>
	{#each files as file}
		<li>
			{#if file.type === 'directory'}
				<button onclick={() => (open = !open)}>{'> '}{file.name}</button>
				{#if open}
					<svelte:self {onSelectFile} files={file.children} depth={depth + 1} />
				{/if}
			{:else}
				<button style:padding-left={`${spacing}rem`} onclick={() => onSelectFile?.(file.name)}
					>{file.name}</button
				>
			{/if}
		</li>
	{/each}
</ul>

<style>
	ul {
		margin: 0;
		padding: 0;
		list-style-type: none;
	}

	button {
		font-family: var(--font-system);
		font-size: 0.8rem;
		background-color: transparent;
		color: var(--color-white);
		border: none;
	}

	button:hover {
		cursor: pointer;
	}
</style>
