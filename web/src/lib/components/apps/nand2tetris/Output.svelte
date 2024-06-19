<script lang="ts">
	import { getNand2TetrisContext } from './Nand2Tetris.svelte';
	import Tabs from './Tabs.svelte';

	const context = getNand2TetrisContext();

	const tabs = $derived.by(() => {
		const selectedFileType = context.selectedFile?.name.split('.').pop();

		if (selectedFileType === 'jack' || selectedFileType === 'vm' || selectedFileType === 'asm') {
			return (
				{
					jack: ['TOKENS', 'PARSE TREE', 'VM', 'ASM', 'HACK'],
					vm: ['ASM', 'HACK'],
					asm: ['HACK']
				} as const satisfies Record<
					'jack' | 'vm' | 'asm',
					('TOKENS' | 'PARSE TREE' | 'VM' | 'ASM' | 'HACK')[]
				>
			)[selectedFileType];
		}

		return [];
	});
</script>

<div class="output">
	<Tabs {tabs} />
</div>

<style>
	.output {
		grid-area: output;
	}
</style>
