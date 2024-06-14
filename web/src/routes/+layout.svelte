<script lang="ts">
	import '../app.css';

	const { children } = $props();
</script>

{@render children()}

<style>
	:global(body) {
		height: 100dvh;
		width: 100dvw;
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 0;
		/* https://cssgradient.io/ **/
		background: rgb(95, 42, 131);
		background: linear-gradient(
			45deg,
			rgba(95, 42, 131, 1) 0%,
			rgba(150, 24, 24, 1) 50%,
			rgba(208, 146, 58, 1) 100%
		);
	}
</style>
