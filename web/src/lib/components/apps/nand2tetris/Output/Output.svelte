<script lang="ts" context="module">
	import { type CompilationResult } from '../../../../../../../projects/10-11/src/compiler/JackCompiler';
	import JackParseTree from '../../../../../../../projects/10-11/src/parser/JackParseTree';
	import { Compiler } from './Compiler';

	type Tab = 'TOKENS' | 'PARSE TREE' | 'VM' | 'ASM' | 'HACK';
	const tabConfig = {
		jack: ['TOKENS', 'PARSE TREE', 'VM', 'ASM', 'HACK'],
		vm: ['ASM', 'HACK'],
		asm: ['HACK']
	} as const satisfies Record<'jack' | 'vm' | 'asm', Tab[]>;

	const tabToCompilationResultKey = {
		TOKENS: 'tokens',
		'PARSE TREE': 'jackParseTree',
		VM: 'vmInstructions',
		ASM: 'assemblyInstructions',
		HACK: 'hackInstructions'
	} as const satisfies Record<Tab, keyof CompilationResult>;

	const isValidFileType = (
		fileExtension: string | undefined
	): fileExtension is keyof typeof tabConfig => ['jack', 'vm', 'asm'].includes(fileExtension ?? '');
</script>

<script lang="ts">
	import Tabs from '../Tabs.svelte';
	import { getNand2TetrisContext } from '../context.svelte';
	import Asm from './Asm.svelte';
	import Hack from './Hack.svelte';
	import Tokens from './Tokens.svelte';

	const context = getNand2TetrisContext();

	const selectedFileExtension = $derived(context.selectedFile?.name.split('.').pop());

	const tabs = $derived.by(() => {
		return isValidFileType(selectedFileExtension) ? tabConfig[selectedFileExtension] : [];
	});

	let currentTab = $state<Tab>();
	$effect(() => {
		currentTab = tabs[0];
	});

	const output = $derived.by(() => {
		if (!context.selectedFile || !isValidFileType(selectedFileExtension) || !currentTab) {
			return undefined;
		}

		if (selectedFileExtension === 'asm') {
			const result = Compiler.assembleAsm(context.selectedFile);
			return result.success ? result.hackInstructions : result.message;
		}

		if (selectedFileExtension === 'vm') {
			const result = Compiler.translateVm(context.selectedFile);

			if (currentTab === 'ASM' || currentTab === 'HACK') {
				const tabResult = result[tabToCompilationResultKey[currentTab]];
				return result.success ? tabResult : result.message;
			}
		}

		const result = Compiler.jackCompiler.compile({
			jackFileContents: context.selectedFile.contents
		});
		const tabResult = result[tabToCompilationResultKey[currentTab]];

		if (result.success) {
			if (tabResult instanceof JackParseTree) {
				return result.jackParseTree.toXmlString();
			}
			if (currentTab === 'TOKENS') {
				return result.tokens;
			} else if (currentTab === 'ASM') {
				return result.assemblyInstructions;
			} else if (currentTab === 'HACK') {
				return result.hackInstructions;
			}

			return tabResult?.join('\n');
		}

		return result.message;
	});
</script>

{#if context.selectedFile}
	<div class="output">
		<div class="tabs">
			<Tabs
				tabs={tabs.map((tab) => ({ label: tab, key: tab }))}
				selected={currentTab}
				onSelectTab={(tab) => (currentTab = tab.label)}
			/>
		</div>
		<div class="content">
			{#if currentTab === 'TOKENS'}
				<Tokens tokens={output} />
			{:else if currentTab === 'ASM'}
				<Asm instructions={output} />
			{:else if currentTab === 'HACK'}
				<Hack instructions={output} />
			{:else}
				<!-- TODO: instead of using textarea, render a component with syntax highlighting -->
				<textarea spellcheck="false" value={output ?? ''} readonly></textarea>
			{/if}
		</div>
	</div>
{/if}

<style>
	textarea {
		height: 100%;
		width: 100%;
		flex: 1;
		font-family: var(--font-code);
		background-color: var(--color-bg-light);
		color: var(--color-white);
		margin: 0;
		padding: 1rem;
		border: none;
		resize: none;
		text-wrap: nowrap;
	}

	textarea:focus {
		outline: none;
	}

	.output {
		grid-area: output;
		display: flex;
		flex-direction: column;
		border-left: 1px solid var(--color-grey-border);
		overflow: hidden;
	}

	@media (width <= 1280px) {
		.output {
			border-top: 1px solid var(--color-grey-border);
			border-left: none;
		}
	}

	.content {
		flex: 1;
		background-color: var(--color-bg-light);
		padding: 1rem;
		overflow: auto;
	}
</style>
