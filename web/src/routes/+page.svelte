<script lang="ts">
	import JackCompiler, {
		type CompilationResult
	} from '../../../projects/10-11/src/compiler/JackCompiler';
	import Editor from './components/Editor.svelte';
	import Explorer from './components/Explorer.svelte';

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
					compilationResult['tokens']?.map(({ type, token }) => `${type} '${token}'`).join('\n') ??
					'Tokens undefined'
				);
			case 'jackParseTree':
				return compilationResult['jackParseTree']?.toXmlString() ?? 'Parse tree undefined';
			case 'vmInstructions':
			case 'assemblyInstructions':
			case 'hackInstructions':
				return compilationResult[selectedOutput]?.join('\n') ?? `${selectedOutput} undefined`;
		}
	});

	const outputTabLabels = {
		tokens: 'TOKENS',
		jackParseTree: 'PARSE TREE',
		vmInstructions: '.VM',
		assemblyInstructions: '.ASM',
		hackInstructions: '.HACK'
	} as const satisfies Record<typeof selectedOutput, string>;
</script>

<Explorer
	fileNames={['Main.jack', 'FizzBuzz.jack']}
	onSelectFile={(fileName) => {
		jackFileContents = fileName === 'Main.jack' ? empty : fizzBuzz ?? empty;
	}}
/>
<Editor
	fileContents={jackFileContents}
	onInput={(value) => {
		jackFileContents = value;
	}}
/>
<div id="output">
	<div class="tabs">
		{#each ['tokens', 'jackParseTree', 'vmInstructions', 'assemblyInstructions', 'hackInstructions'] as const satisfies (typeof selectedOutput)[] as option}
			<button
				class="tab"
				class:tab-selected={selectedOutput === option}
				onclick={() => (selectedOutput = option)}>{outputTabLabels[option]}</button
			>
		{/each}
	</div>
	<textarea
		spellcheck="false"
		value={output}
		readonly
		style:color={compilationResult.success ? '' : 'var(--color-red)'}
	></textarea>
</div>

<style>
	/* TODO: dont copy paste these button styles */
	button {
		background-color: transparent;
		color: var(--color-white);
		font-size: 0.8rem;
		border: none;
	}

	textarea {
		flex: 1;
		min-height: 24ch;
		resize: none;
		background-color: var(--color-bg-light);
		color: var(--color-white);
		border: none;
		margin: 0;
		padding: 1rem;
	}

	textarea:focus {
		outline: none;
	}

	.tabs {
		display: flex;
		justify-content: flex-start;
		text-wrap: nowrap;
	}

	.tab {
		background-color: var(--color-bg-dark);
		color: var(--color-grey);
		min-width: 10%;
		font-size: 1rem;
		padding: 0.5rem;
	}

	.tab:hover {
		cursor: pointer;
	}

	.tab-selected {
		background-color: var(--color-bg-light);
		color: var(--color-white-bright);
		border-bottom: 2px solid var(--color-white-bright);
		border-right: 1px solid var(--color-black);
	}

	#output {
		grid-area: output;
		border-left: 1px solid var(--color-grey-border);
	}

	#output {
		display: flex;
		flex-direction: column;
	}

	@media (width <= 1280px) {
		#output {
			border-top: 1px solid var(--color-grey-dim);
			border-left: none;
		}
	}
</style>
