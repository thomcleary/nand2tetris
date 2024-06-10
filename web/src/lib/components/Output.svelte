<script lang="ts">
	import type JackCompiler from '../../../../projects/10-11/src/compiler/JackCompiler';

	type OutputProps = {
		compilationResult: ReturnType<JackCompiler['compile']>;
	};

	const { compilationResult }: OutputProps = $props();

	const tabs = ['TOKENS', 'PARSE TREE', 'VM', 'ASM', 'HACK'] as const;

	let selectedTab = $state<(typeof tabs)[number]>('TOKENS');

	let output = $derived(
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
			}
		})() ?? (compilationResult.success ? '' : compilationResult.message)
	);
</script>

<div id="output">
	<div class="tabs">
		{#each tabs as tab}
			<button
				class="tab"
				class:tab-selected={selectedTab === tab}
				onclick={() => {
					selectedTab = tab;
				}}>{tab}</button
			>
		{/each}
	</div>
	<!--
  TODO: instead of using textarea, render a component with syntax highlighting
  -->
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

	/* TODO: don't duplicate tabs (see Output component)*/
	.tabs {
		display: flex;
		justify-content: flex-start;
		text-wrap: nowrap;
	}

	.tab {
		font-family: var(--font-system);
		background-color: var(--color-bg-dark);
		color: var(--color-grey);
		min-width: 10%;
		font-size: 1rem;
		padding: 0.5rem 1rem;
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
