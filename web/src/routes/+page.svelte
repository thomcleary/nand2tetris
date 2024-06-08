<script lang="ts">
	import JackCompiler from '../../../projects/10-11/src/compiler/JackCompiler';

	const { data } = $props();
	const { defaultFileContents, emptyProgramFileContents } = data;

	const jackCompiler = new JackCompiler();

	let jackFileContents = $state(defaultFileContents);
	let compilationResult = $derived(jackCompiler.compile({ jackFileContents }));

	const clearFileContents = () => {
		jackFileContents = emptyProgramFileContents;
	};

	const resetFileContents = () => {
		jackFileContents = defaultFileContents;
	};
</script>

<main>
	<div>
		<button onclick={clearFileContents}>Clear</button>
		<button onclick={resetFileContents}>Reset</button>
	</div>
	<textarea cols="80" spellcheck="false" bind:value={jackFileContents}></textarea>
	<textarea
		cols="80"
		spellcheck="false"
		value={compilationResult.success
			? compilationResult.vmInstructions.join('\n')
			: compilationResult.message}
		readonly
		style:color={compilationResult.success ? '' : 'red'}
	></textarea>
</main>

<style>
	:global(body) {
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0;
	}

	main {
		flex: 1;
		display: flex;
		gap: 2rem;
		padding: 2rem;
	}

	textarea {
		resize: none;
	}
</style>
