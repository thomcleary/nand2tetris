<script lang="ts">
	type ExplorerProps = {
		fileNames: string[];
		onSelectFile: (fileName: string) => void;
	};

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
		margin: 0;
		padding: 0;
		list-style-type: none;
	}

	/* TODO: dont copy paste these button styles */
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
