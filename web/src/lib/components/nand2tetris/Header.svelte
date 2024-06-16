<script lang="ts">
	type HeaderProps = {
		onWindowButtonClick?: (colour: keyof typeof colours) => void;
	};

	const { onWindowButtonClick }: HeaderProps = $props();

	const colours = {
		red: '#EC695E',
		yellow: '#F5BE4F',
		green: '#60C253'
	} as const satisfies Record<string, `#${string}`>;
</script>

{#snippet windowButtons()}
	{#snippet circle(colour: keyof typeof colours)}
		<button onclick={() => onWindowButtonClick?.(colour)}>
			<svg fill={colours[colour]} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
				<circle cx="50" cy="50" r="50" />
			</svg>
		</button>
	{/snippet}

	<div id="window-buttons">
		{@render circle('red')}
		{@render circle('yellow')}
		{@render circle('green')}
	</div>
{/snippet}

<header>
	{@render windowButtons()}
	<a href="https://www.nand2tetris.org/" target="_blank" rel="noreferrer">nand2tetris</a>
</header>

<style>
	header {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		align-items: center;
		background-color: var(--color-bg-light);
		border-top-left-radius: 1rem;
		border-top-right-radius: 1rem;
	}

	button {
		padding: 0;
		border: 0;
		background-color: transparent;
	}

	button:hover > svg {
		opacity: 0.8;
		cursor: pointer;
	}

	svg {
		width: 0.8rem;
		overflow: visible;
	}

	a {
		font-family: var(--font-system);
		font-size: 0.8rem;
		background-color: rgb(47, 50, 57);
		color: rgb(108, 113, 124);
		margin: 0.4rem;
		padding: 0.2rem;
		border: 1px solid rgb(55, 58, 65);
		border-radius: 0.25rem;
		text-align: center;
		text-decoration: none;
	}

	a:hover {
		color: rgb(159, 165, 179);
		border: 1px solid rgb(69, 73, 80);
	}

	#window-buttons {
		height: 2rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding-left: 0.6rem;
	}
</style>
