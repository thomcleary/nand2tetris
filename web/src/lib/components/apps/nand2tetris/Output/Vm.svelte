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
		color: rgb(187, 125, 216);
	}

	.arithmetic-logical {
		color: rgb(210, 115, 120);
	}

	.segment {
		color: rgb(200, 155, 110);
	}

	.function {
		color: rgb(116, 174, 234);
	}

	.number {
		color: rgb(155, 187, 124);
	}
</style>
