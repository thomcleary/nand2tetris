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
		border: 2px solid var(--color-grey-border);
		border-radius: 1rem;
		/* https://shadows.brumm.af **/
		box-shadow:
			2.8px 2.8px 2.2px rgba(0, 0, 0, 0.059),
			6.7px 6.7px 5.3px rgba(0, 0, 0, 0.085),
			12.5px 12.5px 10px rgba(0, 0, 0, 0.105),
			22.3px 22.3px 17.9px rgba(0, 0, 0, 0.125),
			41.8px 41.8px 33.4px rgba(0, 0, 0, 0.151),
			100px 100px 80px rgba(0, 0, 0, 0.21);
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
