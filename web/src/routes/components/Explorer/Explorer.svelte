<script lang="ts" context="module">
	// TODO: could try and make this generic for better type inference
	// https://github.com/sveltejs/svelte-eslint-parser/pull/477
	export type ExplorerProps = {
		fileNames: string[];
		onSelectFile: (fileName: string) => void;
	};
</script>

<script lang="ts">
	const { fileNames, onSelectFile }: ExplorerProps = $props();
</script>

<div id="explorer">
	<ul>
		{#each fileNames as fileName}
			<li><button onclick={() => onSelectFile(fileName)}>{fileName}</button></li>
		{/each}
	</ul>
</div>

<style>
	ul {
		list-style-type: none;
		margin: 0;
		padding: 0;
	}

	/* TODO: dont copy paste these button styles */
	button {
		background-color: transparent;
		color: var(--color-white);
		font-size: 0.8rem;
		border: none;
	}

	#explorer {
		grid-area: explorer;
		color: var(--color-white);
	}
</style>
