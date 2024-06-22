<script lang="ts" context="module">
	import JackCompiler from '../../../../../../../projects/10-11/src/compiler/JackCompiler';

	type Tab = 'TOKENS' | 'PARSE TREE' | 'VM' | 'ASM' | 'HACK' | 'ERROR';
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
		return (
			compilationResult?.success && isValidFileType(selectedFileExtension)
				? tabConfig[selectedFileExtension]
				: (['ERROR'] satisfies Tab[])
		).map((tab) => ({ label: tab, key: tab }));
	});

	let currentTab = $state<Tab>();
	$effect(() => {
		if (tabs[0].label !== 'ERROR') {
			currentTab = tabs[0].label;
		}
	});
</script>

{#if context.selectedFile}
	<div class="output">
		<div class="tabs">
			<Tabs
				{tabs}
				--color={compilationResult?.success ? undefined : 'rgb(210, 115, 120)'}
				selected={compilationResult?.success ? currentTab : 'ERROR'}
				onSelectTab={(tab) => {
					if (tab.label !== 'ERROR') {
						currentTab = tab.label;
					}
				}}
			/>
		</div>
		<div class="content">
			{#if compilationResult?.success}
				{#if currentTab === 'TOKENS' && compilationResult.tokens}
					<Tokens tokens={compilationResult.tokens} />
				{:else if currentTab === 'PARSE TREE' && compilationResult.jackParseTree}
					<textarea
						spellcheck="false"
						value={compilationResult.jackParseTree.toXmlString()}
						readonly
					></textarea>
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

	p {
		color: rgb(210, 115, 120);
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
