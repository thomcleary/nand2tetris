<script lang="ts">
	import '../app.css';

	const { children } = $props();
</script>

<main>
	{@render children()}
</main>

<style>
	:global(body) {
		height: 100dvh;
		width: 100dvw;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 0;
		background-color: var(--color-bg-dark);
	}

	main {
		flex: 1;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 2rem;
		padding: 1rem;
	}
</style>
