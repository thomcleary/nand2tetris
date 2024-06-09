<script lang="ts">
	import '../app.css';

	const { children } = $props();
</script>

<!-- 
Header and footer sections?
- Header (3 window circles from mac)
- Footer (open file info like in vscode)
-->
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
		justify-content: center;
		align-items: center;
		margin: 0;
		/* https://cssgradient.io/ **/
		background: rgb(131, 58, 180);
		background: linear-gradient(
			45deg,
			rgba(131, 58, 180, 1) 0%,
			rgba(253, 29, 29, 1) 50%,
			rgba(252, 176, 69, 1) 100%
		);
	}

	#layout {
		flex: 1;
		min-height: min(95%, 1440px);
		max-width: min(95%, 2560px);
		display: grid;
		grid-template-columns: minmax(max-content, 10%) 1fr 0.75fr;
		grid-template-areas: 'explorer editor output';
		background-color: var(--color-bg-dark);
		padding-top: 2rem;
		padding-bottom: 1.5rem;
		border-radius: 1rem;
	}

	@media (width <= 1280px) {
		#layout {
			grid-template-columns: minmax(max-content, 10%) 1fr;
			grid-template-rows: auto;
			grid-template-areas:
				'explorer editor'
				'output output';
		}
	}
</style>
