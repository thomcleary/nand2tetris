<script lang="ts">
	import {
		isComment,
		isDigitsOnly,
		isLabel,
		isValidJumpCode
	} from '../../../../../../../projects/06/src/assembler';
	import { PREDEFINED_SYMBOLS } from '../../../../../../../projects/06/src/constants';
	import type { AssemblyInstruction } from '../../../../../../../projects/07-08/src/types';

	type AsmProps = {
		instructions: AssemblyInstruction[];
	};

	const { instructions }: AsmProps = $props();

	const instructionParts = (instruction: AssemblyInstruction) => {
		const parts = instruction.split(';');
		console.log(parts);
		return parts;
	};

	const isAInstruction = (instruction: AssemblyInstruction) => instruction.startsWith('@');

	const isMemoryAddress = (instruction: AssemblyInstruction) => isDigitsOnly(instruction.slice(1));

	const isPredefinedSymbol = (instruction: AssemblyInstruction) =>
		Object.keys(PREDEFINED_SYMBOLS).includes(instruction.slice(1));

	const isRegister = (c: string) => c === 'A' || c === 'D' || c === 'M';
</script>

<div class="asm">
	{#each instructions as instruction}
		<span>
			{#if isAInstruction(instruction)}
				@<span
					class={`${isMemoryAddress(instruction) ? 'memory-address' : isPredefinedSymbol(instruction) ? 'predefined-symbol' : 'label'}`}
					>{instruction.slice(1)}</span
				>
			{:else if isLabel(instruction)}
				(<span class="label">{instruction.replace('(', '').replace(')', '')}</span>)
			{:else if isComment(instruction)}
				<span class="comment">{instruction}</span>
			{:else}
				{#each instructionParts(instruction) as part}
					{#if isValidJumpCode(part)}
						<b>{';'}</b><span class="jump">{part}</span>
					{:else}
						{#each part.split('') as char}
							<span
								class={`${isRegister(char) ? 'register' : !isNaN(Number(char)) ? 'number' : ''}`}
								>{char}</span
							>
						{/each}
					{/if}
				{/each}
			{/if}</span
		>
	{/each}
</div>

<style>
	span {
		font-family: var(--font-code);
		color: var(--color-white);
	}

	b {
		font-weight: 600;
	}

	.asm {
		display: flex;
		flex-direction: column;
	}

	.memory-address {
		color: rgb(210, 115, 120);
	}

	.predefined-symbol {
		color: rgb(200, 155, 110);
	}

	.label {
		color: rgb(116, 174, 234);
	}

	.comment {
		color: var(--color-grey-dim);
	}

	.register {
		color: rgb(210, 115, 120);
	}

	.jump {
		color: rgb(187, 125, 216);
	}

	.number {
		color: rgb(155, 187, 124);
	}
</style>
