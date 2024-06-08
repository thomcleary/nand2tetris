<script lang="ts">
	import JackCompiler, {
		type CompilationResult
	} from '../../../projects/10-11/src/compiler/JackCompiler';

	const { data } = $props();
	const { empty, fizzBuzz } = data;

	const jackCompiler = new JackCompiler();

	let jackFileContents = $state<string>(empty);
	let compilationResult = $derived(jackCompiler.compile({ jackFileContents }));

	let selectedOutput = $state<keyof CompilationResult>('tokens');
	let output = $derived.by<string>(() => {
		if (!compilationResult.success && compilationResult[selectedOutput] === undefined) {
			return compilationResult['message'];
		}

		switch (selectedOutput) {
			case 'tokens':
				return (
					compilationResult['tokens']
						?.map(({ type, token }, index) => `[${index}] ${type} '${token}'`)
						.join('\n') ?? 'Tokens undefined'
				);
			case 'jackParseTree':
				return compilationResult['jackParseTree']?.toXmlString() ?? 'Parse tree undefined';
			case 'vmInstructions':
			case 'assemblyInstructions':
			case 'hackInstructions':
				return (
					compilationResult[selectedOutput]
						?.map((line, index) => `[${index}] ${line}`)
						.join('\n') ?? `${selectedOutput} undefined`
				);
		}
	});
</script>

<main>
	<div class="button-column">
		<button onclick={() => (jackFileContents = empty)}>Clear</button>
		<button
			disabled={!fizzBuzz}
			onclick={() => {
				if (fizzBuzz) {
					jackFileContents = fizzBuzz;
				} else {
					console.log({ fizzBuzz });
				}
			}}>FizzBuzz</button
		>
	</div>
	<textarea cols="80" spellcheck="false" bind:value={jackFileContents}></textarea>
	<textarea
		cols="80"
		spellcheck="false"
		value={output}
		readonly
		style:color={compilationResult.success ? '' : 'red'}
	></textarea>
	<div class="button-column">
		<button onclick={() => (selectedOutput = 'tokens')}>Tokens</button>
		<button onclick={() => (selectedOutput = 'jackParseTree')}>Parse Tree</button>
		<button onclick={() => (selectedOutput = 'vmInstructions')}>.vm</button>
		<button onclick={() => (selectedOutput = 'assemblyInstructions')}>.asm</button>
		<button onclick={() => (selectedOutput = 'hackInstructions')}>.hack</button>
	</div>
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
		flex-wrap: wrap;
		gap: 2rem;
		padding: 2rem;
	}

	textarea {
		resize: none;
	}

	.button-column {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
