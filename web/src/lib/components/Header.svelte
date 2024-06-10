<script lang="ts">
	const colors = {
		red: '#EC695E',
		yellow: '#F5BE4F',
		green: '#60C253'
	} as const satisfies Record<string, `#${string}`>;
</script>

{#snippet windowButtons()}
	{#snippet circle(color: keyof typeof colors)}
		<svg fill={colors[color]} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
			<circle cx="50" cy="50" r="50" />
		</svg>
	{/snippet}

	<div id="window-buttons">
		{@render circle('red')}
		{@render circle('yellow')}
		{@render circle('green')}
	</div>
{/snippet}

<header>
	{@render windowButtons()}
	<div id="window-title"><span>nand2tetris</span></div>
</header>

<style>
	header {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		background-color: var(--color-bg-light);
		border-top-left-radius: 1rem;
		border-top-right-radius: 1rem;
	}

	svg {
		width: 0.8rem;
	}

	svg:hover {
		opacity: 0.85;
	}

	#window-buttons {
		display: flex;
		gap: 0.5rem;
		height: 2rem;
		padding-left: 0.6rem;
	}

	#window-title {
		background-color: rgb(47, 50, 57);
		margin: 0.3rem;
		border: 1px solid rgb(55, 58, 65);
		border-radius: 0.25rem;
		text-align: center;
	}

	#window-title:hover {
		border: 1px solid rgb(69, 73, 80);
	}

	#window-title:hover > span {
		color: rgb(159, 165, 179);
	}

	#window-title > span {
		font-family: var(--font-system);
		font-size: 0.8rem;
		color: rgb(108, 113, 124);
	}
</style>
