<script lang="ts" context="module">
	export type File<T extends string> =
		| { type: 'directory'; name: T; children: File<T>[] }
		| { type: 'file'; name: T };
</script>

<script lang="ts" generics="TodoFixGenerics extends string">
	// eslint-disable-next-line no-undef
	type T = TodoFixGenerics;
	type ExplorerProps = {
		files: readonly File<T>[];
		onSelectFile?: (fileName: T) => void;
	};

	const { files, onSelectFile }: ExplorerProps = $props();
</script>

<!-- {#snippet directoryTree(file: )} -->

<!-- {/snippet} -->

<div id="explorer">
	<ul>
		{#each files as file}
			{#if file.type === 'file'}
				<li><button onclick={() => onSelectFile?.(file.name)}>{file.name}</button></li>
			{:else}
				<li>
					<button>{file.name}</button>
					<ul>
						{#each file.children as child}
							<!-- TODO: need to make this recursive -->
							<li><button>{child.name}</button></li>
						{/each}
					</ul>
				</li>
			{/if}
		{/each}
	</ul>
</div>

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

	#explorer {
		grid-area: explorer;
		color: var(--color-white);
	}
</style>
