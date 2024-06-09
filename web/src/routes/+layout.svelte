<script lang="ts">
	import '../app.css';

	const { children } = $props();
</script>

<!-- 
Probably want to have the three sections here
- FileExplorer
- Editor (<main> should go in here)
- Output
-->
<div id="layout">
	{@render children()}
</div>

<style>
	:global(body) {
		height: 100dvh;
		width: 100dvw;
		display: flex;
		margin: 0;
		background-color: var(--color-bg-dark);
	}

	#layout {
		flex: 1;
		display: grid;
		grid-template-columns: minmax(min-content, 10%) 1fr 0.5fr;
		grid-template-areas: 'explorer editor output';
	}

	@media (width <= 1280px) {
		#layout {
			grid-template-columns: minmax(min-content, 10%) 1fr;
			grid-template-rows: auto;
			grid-template-areas:
				'explorer editor'
				'output output';
		}
	}
</style>
