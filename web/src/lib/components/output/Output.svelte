<script lang="ts">
	import type JackCompiler from '../../../../../projects/10-11/src/compiler/JackCompiler';
	import Tabs from '../shared/Tabs.svelte';

	type OutputProps = {
		compilationResult: ReturnType<JackCompiler['compile']>;
	};

	const { compilationResult }: OutputProps = $props();

	const tabs = ['TOKENS', 'PARSE TREE', 'VM', 'ASM', 'HACK'];

	let selectedTab = $state(tabs[0]);
	let output = $derived.by(
		() =>
			(() => {
				switch (selectedTab) {
					case 'TOKENS':
						return compilationResult.tokens
							?.map(({ type, token }) => `${type} '${token}'`)
							.join('\n');
					case 'PARSE TREE':
						return compilationResult.jackParseTree?.toXmlString();
					case 'VM':
						return compilationResult.vmInstructions?.join('\n');
					case 'ASM':
						return compilationResult.assemblyInstructions?.join('\n');
					case 'HACK':
						return compilationResult.hackInstructions?.join('\n');
					default:
						return 'Something went wrong';
				}
			})() ?? (compilationResult.success ? 'No output' : compilationResult.message)
	);
</script>

<div id="output">
	<Tabs {tabs} onSelectTab={(tab) => (selectedTab = tab)} />
	<!-- TODO: instead of using textarea, render a component with syntax highlighting -->
	<textarea
		spellcheck="false"
		value={output}
		readonly
		style:color={compilationResult.success ? '' : 'var(--color-red)'}
	></textarea>
</div>

<style>
	textarea {
		min-height: 24ch;
		flex: 1;
		background-color: var(--color-bg-light);
		color: var(--color-white);
		margin: 0;
		padding: 1rem;
		border: none;
		resize: none;
	}

	textarea:focus {
		outline: none;
	}

	#output {
		grid-area: output;
		display: flex;
		flex-direction: column;
		border-left: 1px solid var(--color-grey-border);
	}

	@media (width <= 1280px) {
		#output {
			border-top: 1px solid var(--color-grey-border);
			border-left: none;
		}
	}
</style>
