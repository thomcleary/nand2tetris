<script lang="ts">
	import type { Token } from '../../../../../../../projects/10-11/src/types/Token';
	import {
		isOperator,
		isUnaryOperator
	} from '../../../../../../../projects/10-11/src/utils/predicates';

	type TokensProps = {
		tokens: Token[];
	};

	const { tokens }: TokensProps = $props();

	const isOperatorToken = (token: Token) => isOperator(token) || isUnaryOperator(token);
</script>

<div class="tokens">
	{#each tokens as token}
		<span
			>{token.type}
			<b
				class:keyword={token.type === 'keyword'}
				class:identifier={token.type === 'identifier'}
				class:symbol={token.type === 'symbol' && !isOperatorToken(token)}
				class:operator={isOperatorToken(token)}
				class:integerConstant={token.type === 'integerConstant'}
				class:stringConstant={token.type === 'stringConstant'}>{token.token}</b
			></span
		>
	{/each}
</div>

<style>
	span {
		font-family: var(--font-code);
		color: rgb(128, 132, 141);
	}

	b {
		font-weight: 600;
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
