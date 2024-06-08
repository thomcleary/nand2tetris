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

<div id="input">
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
</div>
<div id="output">
	<div class="button-column">
		<button onclick={() => (selectedOutput = 'tokens')}>Tokens</button>
		<button onclick={() => (selectedOutput = 'jackParseTree')}>Parse Tree</button>
		<button onclick={() => (selectedOutput = 'vmInstructions')}>.vm</button>
		<button onclick={() => (selectedOutput = 'assemblyInstructions')}>.asm</button>
		<button onclick={() => (selectedOutput = 'hackInstructions')}>.hack</button>
	</div>
	<textarea
		cols="80"
		spellcheck="false"
		value={output}
		readonly
		style:color={compilationResult.success ? '' : 'red'}
	></textarea>
</div>

<style>
	textarea {
		width: min(100%, 80ch);
		min-height: 24ch;
		resize: none;
		background-color: var(--color-bg-light);
		color: var(--color-white);
		border: none;
		border-radius: 4px;
		padding: 0.5rem;
	}

	textarea:focus {
		outline: 1px solid var(--color-dim);
	}

	.button-column {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	#input,
	#output {
		display: flex;
		gap: 0.5rem;
	}
</style>
