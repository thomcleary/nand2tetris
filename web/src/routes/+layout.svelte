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
		background: rgb(131, 58, 180);
		background: linear-gradient(
			45deg,
			rgba(131, 58, 180, 1) 0%,
			rgba(253, 29, 29, 1) 50%,
			rgba(252, 176, 69, 1) 100%
		);
	}
</style>
