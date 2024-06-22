<script lang="ts">
	import type { VmInstruction } from '../../../../../../../projects/10-11/src/types/VmInstruction';

	type VmProps = {
		instructions: readonly VmInstruction[];
	};

	const { instructions }: VmProps = $props();
</script>

<div class="vm">
	{#each instructions as instruction}
		<span>{instruction}</span>
	{/each}
</div>

<style>
	.vm {
		display: flex;
		flex-direction: column;
	}
</style>
