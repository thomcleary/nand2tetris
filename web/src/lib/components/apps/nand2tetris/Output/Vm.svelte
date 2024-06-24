<script lang="ts">
	import { FunctionCommand } from '../../../../../../../projects/07-08/src/constants';
	import {
		isArithemticLogicalCommand,
		isBranchCommand,
		isSegment,
		isStackCommand
	} from '../../../../../../../projects/07-08/src/utils';
	import type { VmInstruction } from '../../../../../../../projects/10-11/src/types/VmInstruction';

	type VmProps = {
		instructions: readonly VmInstruction[];
	};

	const { instructions }: VmProps = $props();

	const getClass = (part: string) => {
		if (part === 'return' || isStackCommand(part) || isBranchCommand(part)) {
			return 'keyword';
		}

		if (isArithemticLogicalCommand(part)) {
			return 'arithmetic-logical';
		}

		if (isSegment(part)) {
			return 'segment';
		}

		if ((Object.values(FunctionCommand) as string[]).includes(part)) {
			return 'function';
		}

		if (!isNaN(Number(part))) {
			return 'number';
		}

		return '';
	};
</script>

<div class="vm">
	{#each instructions as instruction}
		<span>
			{#each instruction.split(' ') as part}
				<span class={getClass(part)}>{part}{' '}</span>
			{/each}
		</span>
	{/each}
</div>

<style>
	span {
		font-family: var(--font-code);
		color: var(--color-grey);
	}

	.vm {
		display: flex;
		flex-direction: column;
	}

	.keyword {
		color: var(--color-purple);
	}

	.arithmetic-logical {
		color: var(--color-red);
	}

	.segment {
		color: var(--color-orange);
	}

	.function {
		color: var(--color-blue);
	}

	.number {
		color: var(--color-green);
	}
</style>
