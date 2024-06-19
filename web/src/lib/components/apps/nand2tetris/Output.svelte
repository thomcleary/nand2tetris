<script lang="ts" context="module">
	import type { File } from '$lib/types';
	import { assemble } from '../../../../../../projects/06/src/assembler';
	import { toAssemblyInstructions } from '../../../../../../projects/06/src/utils';
	import { toVmInstructions } from '../../../../../../projects/07-08/src/utils';
	import { translate } from '../../../../../../projects/07-08/src/vmTranslator';
	import {
		JackCompiler,
		type CompilationResult
	} from '../../../../../../projects/10-11/src/compiler/JackCompiler';
	import JackParseTree from '../../../../../../projects/10-11/src/parser/JackParseTree';
	import type { Result } from '../../../../../../projects/10-11/src/types';

	// TODO: move this out into separate .ts file
	// Make the return type change based on the file extension of the File being passed in
	const jackCompiler = new JackCompiler();

	type VmTranslationResult = Pick<CompilationResult, 'assemblyInstructions' | 'hackInstructions'>;

	const translateVm = (vmFile: File): Result<VmTranslationResult, Partial<VmTranslationResult>> => {
		const vmInstructions = toVmInstructions(vmFile.contents);

		const translationResult = translate({ vmInstructions, fileName: vmFile.name });

		if (!translationResult.success) {
			return translationResult;
		}

		const { assemblyInstructions } = translationResult;
		const assemblerResult = assemble({ assemblyInstructions });

		return { assemblyInstructions, ...assemblerResult };
	};

	type AssemblerResult = Pick<CompilationResult, 'hackInstructions'>;

	const assembleAsm = (asmFile: File): Result<AssemblerResult, Partial<AssemblerResult>> =>
		assemble({ assemblyInstructions: toAssemblyInstructions(asmFile.contents) });

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
	import { getNand2TetrisContext } from './Nand2Tetris.svelte';
	import Tabs from './Tabs.svelte';

	const context = getNand2TetrisContext();

	let selectedTab = $state<Tab>();

	const selectedFileExtension = $derived(context.selectedFile?.name.split('.').pop());

	const tabs = $derived.by(() => {
		return isValidFileType(selectedFileExtension) ? tabConfig[selectedFileExtension] : [];
	});

	const output = $derived.by(() => {
		if (!context.selectedFile || !isValidFileType(selectedFileExtension) || !selectedTab) {
			return undefined;
		}

		if (selectedFileExtension === 'asm') {
			const result = assembleAsm(context.selectedFile);
			return result.success ? result.hackInstructions.join('\n') : result.message;
		}

		if (selectedFileExtension === 'vm') {
			const result = translateVm(context.selectedFile);

			if (selectedTab === 'ASM' || selectedTab === 'HACK') {
				const tabResult = result[tabToCompilationResultKey[selectedTab]];
				return result.success ? tabResult?.join('\n') : result.message;
			}
		}

		const result = jackCompiler.compile({ jackFileContents: context.selectedFile.contents });
		const tabResult = result[tabToCompilationResultKey[selectedTab]];

		if (result.success) {
			if (tabResult instanceof JackParseTree) {
				return result.jackParseTree.toXmlString();
			}
			if (selectedTab === 'TOKENS') {
				return result.tokens.map(({ type, token }) => `${type} '${token}'`).join('\n');
			}
			return tabResult?.join('\n');
		}

		return result.message;
	});
</script>

<div class="output">
	{#if context.selectedFile}
		<Tabs {tabs} bind:selected={selectedTab} />
		<!-- TODO: instead of using textarea, render a component with syntax highlighting -->
		<textarea spellcheck="false" value={output ?? ''} readonly></textarea>
	{/if}
</div>

<style>
	textarea {
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
	}

	@media (width <= 1280px) {
		.output {
			border-top: 1px solid var(--color-grey-border);
			border-left: none;
		}
	}
</style>
