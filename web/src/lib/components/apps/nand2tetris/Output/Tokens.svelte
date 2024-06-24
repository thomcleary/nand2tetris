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
		color: var(--color-purple);
	}

	.identifier {
		color: var(--color-red);
	}

	.symbol {
		color: var(--color-orange);
	}

	.operator {
		color: var(--color-turquoise);
	}

	.integerConstant {
		color: var(--color-yellow);
	}

	.stringConstant {
		color: var(--color-green);
	}
</style>
