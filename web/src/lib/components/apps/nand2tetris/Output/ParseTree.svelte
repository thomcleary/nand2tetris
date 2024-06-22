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
		color: rgb(210, 115, 120);
	}

	.symbol {
		color: rgb(200, 155, 110);
	}

	.keyword {
		color: rgb(187, 125, 216);
	}

	.integerConstant {
		color: rgb(102, 164, 176);
	}

	.stringConstant {
		color: rgb(155, 187, 124);
	}
</style>
