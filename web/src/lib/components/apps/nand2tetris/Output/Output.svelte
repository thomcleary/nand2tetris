<script lang="ts" context="module">
	import JackCompiler from '../../../../../../../projects/10-11/src/compiler/JackCompiler';

	type Tab = 'TOKENS' | 'PARSE TREE' | 'VM' | 'ASM' | 'HACK';
	const tabConfig = {
		jack: ['TOKENS', 'PARSE TREE', 'VM', 'ASM', 'HACK'],
		vm: ['ASM', 'HACK'],
		asm: ['HACK']
	} as const satisfies Record<'jack' | 'vm' | 'asm', Tab[]>;

	const isValidFileType = (
		fileExtension: string | undefined
	): fileExtension is keyof typeof tabConfig => ['jack', 'vm', 'asm'].includes(fileExtension ?? '');
</script>

<script lang="ts">
	import Tabs from '../Tabs.svelte';
	import { getNand2TetrisContext } from '../context.svelte';
	import Asm from './Asm.svelte';
	import { Compiler } from './Compiler';
	import Hack from './Hack.svelte';
	import ParseTree from './ParseTree.svelte';
	import Tokens from './Tokens.svelte';
	import Vm from './Vm.svelte';

	const context = getNand2TetrisContext();

	const selectedFileExtension = $derived(context.selectedFile?.name.split('.').pop());

	const compilationResult = $derived.by(
		(): Partial<ReturnType<JackCompiler['compile']>> | undefined => {
			if (!context.selectedFile || !isValidFileType(selectedFileExtension)) {
				return undefined;
			}

			if (selectedFileExtension === 'asm') {
				return Compiler.assembleAsm(context.selectedFile);
			}

			if (selectedFileExtension === 'vm') {
				return Compiler.translateVm(context.selectedFile);
			}

			return Compiler.jackCompiler.compile({ jackFileContents: context.selectedFile.contents });
		}
	);

	const tabs = $derived.by(() => {
		return (isValidFileType(selectedFileExtension) ? tabConfig[selectedFileExtension] : []).map(
			(tab) => ({ label: tab, key: tab })
		);
	});

	let currentTab = $state<Tab>();
	$effect(() => {
		if (!currentTab || !tabs.some((t) => t.label === currentTab)) {
			currentTab = tabs[0]?.label;
		}
	});
</script>

{#if context.selectedFile}
	<div class="output">
		<div class="tabs">
			<Tabs {tabs} selected={currentTab} onSelectTab={(tab) => (currentTab = tab.label)} />
		</div>
		<div class="content">
			{#if compilationResult?.success}
				{#if currentTab === 'TOKENS' && compilationResult.tokens}
					<Tokens tokens={compilationResult.tokens} />
				{:else if currentTab === 'PARSE TREE' && compilationResult.jackParseTree}
					<ParseTree parseTree={compilationResult.jackParseTree} />
				{:else if currentTab === 'VM' && compilationResult.vmInstructions}
					<Vm instructions={compilationResult.vmInstructions} />
				{:else if currentTab === 'ASM' && compilationResult.assemblyInstructions}
					<Asm instructions={compilationResult.assemblyInstructions} />
				{:else if currentTab === 'HACK' && compilationResult.hackInstructions}
					<Hack instructions={compilationResult.hackInstructions} />
				{/if}
			{:else if compilationResult?.success === false}
				<p>{compilationResult.message}</p>
			{/if}
		</div>
	</div>
{/if}

<style>
	p {
		color: var(--color-red);
		margin: 0;
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
