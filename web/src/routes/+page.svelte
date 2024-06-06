<script lang="ts">
	import JackCompiler from '../../../projects/10-11/src/compiler/JackCompiler';

	const { data } = $props();

	const jackCompiler = new JackCompiler();
	const { contents: defaultContents, program: defaultProgram } = data.jackPrograms[0];

	const compiledProgramResult = jackCompiler.compile({ jackProgram: defaultProgram });

	$inspect(data);
</script>

<main>
	<textarea cols="80" spellcheck="false">{defaultContents}</textarea>
	<textarea cols="80" spellcheck="false"
		>{compiledProgramResult.success
			? compiledProgramResult.vmInstructions.join('\n')
			: compiledProgramResult.message}</textarea
	>
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
