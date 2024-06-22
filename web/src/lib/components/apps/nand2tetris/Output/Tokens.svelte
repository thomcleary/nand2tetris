<script lang="ts">
	import type { Token } from '../../../../../../../projects/10-11/src/types/Token';
	import {
		isOperator,
		isUnaryOperator
	} from '../../../../../../../projects/10-11/src/utils/predicates';

	type TokensProps = {
		tokens: readonly Token[];
	};

	const { tokens }: TokensProps = $props();

	const getClass = (token: Token) => {
		if (token.type === 'symbol') {
			return isOperator(token) || isUnaryOperator(token) ? 'operator' : 'symbol';
		}
		return token.type;
	};
</script>

<div class="tokens">
	{#each tokens as token}
		<span
			>{token.type}
			<span class={getClass(token)}>{token.token}</span></span
		>
	{/each}
</div>

<style>
	span {
		font-family: var(--font-code);
		color: rgb(128, 132, 141);
	}

	.tokens {
		display: flex;
		flex-direction: column;
	}

	.keyword {
		color: rgb(187, 125, 216);
	}

	.identifier {
		color: rgb(210, 115, 120);
	}

	.symbol {
		color: rgb(200, 155, 110);
	}

	.operator {
		color: rgb(102, 164, 176);
	}

	.integerConstant {
		color: rgb(223, 193, 133);
	}

	.stringConstant {
		color: rgb(155, 187, 124);
	}
</style>
