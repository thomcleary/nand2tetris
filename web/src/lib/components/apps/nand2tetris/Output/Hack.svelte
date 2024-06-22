<script lang="ts">
	type HackProps = {
		instructions: readonly string[];
	};

	const { instructions }: HackProps = $props();
</script>

<div class="hack">
	{#each instructions as instruction}
		<span>{instruction}</span>
	{/each}
</div>

<style>
	.hack {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	span {
		font-family: var(--font-code);
		color: var(--color-white);
		text-wrap: nowrap;
	}
</style>
