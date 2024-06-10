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
		font-family: var(--font-system);
	}

	#explorer {
		grid-area: explorer;
		color: var(--color-white);
	}
</style>
