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

<div id="explorer" style:color="var(--color-white)">
	<ul>
		<li>🟧 file 1</li>
		<li>🟧 file 2</li>
		<li>🟧 file 3</li>
	</ul>
</div>
<div id="editor">
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
	<div class="button-row">
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
	ul {
		list-style-type: none;
	}

	textarea {
		flex: 1;
		min-height: 24ch;
		resize: none;
		background-color: var(--color-bg-light);
		color: var(--color-white);
		border: none;
		padding: 0.5rem;
	}

	textarea:focus {
		outline: 1px solid var(--color-dim);
	}

	.button-row {
		display: flex;
		gap: 1rem;
	}

	#explorer {
		grid-area: explorer;
		text-wrap: nowrap;
	}

	#editor {
		grid-area: editor;
	}

	#output {
		grid-area: output;
	}

	#editor,
	#output {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
</style>
