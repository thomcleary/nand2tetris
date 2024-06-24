<script lang="ts">
	import type JackParseTree from '../../../../../../../projects/10-11/src/parser/JackParseTree';

	type ParseTreeProps = {
		parseTree: JackParseTree;
	};

	const { parseTree }: ParseTreeProps = $props();

	const getClass = (line: string) => {
		for (const token of ['identifier', 'symbol', 'keyword', 'integerConstant', 'stringConstant']) {
			if (line.includes(token)) {
				return token;
			}
		}

		return 'grammar-rule';
	};
</script>

<div class="parse-tree">
	{#each parseTree.toXmlString().split('\n') as line}
		<span class={getClass(line)}>{line}</span>
	{/each}
</div>

<style>
	span {
		white-space: pre;
		font-family: var(--font-code);
		color: var(--color-white);
	}

	.depth {
		color: var(--color-grey-dim);
	}

	.parse-tree {
		display: flex;
		flex-direction: column;
	}

	.grammar-rule {
		color: var(--color-grey);
	}

	.identifier {
		color: var(--color-red);
	}

	.symbol {
		color: var(--color-orange);
	}

	.keyword {
		color: var(--color-purple);
	}

	.integerConstant {
		color: var(--color-turquoise);
	}

	.stringConstant {
		color: var(--color-green);
	}
</style>
