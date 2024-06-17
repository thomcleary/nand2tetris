<script lang="ts">
	import MenuBar from '$lib/components/desktop/MenuBar.svelte';
	import '../app.css';

	const { children } = $props();
</script>

<MenuBar />
{@render children()}

<style>
	:global(html) {
		background-color: black;
	}

	:global(body) {
		height: 100dvh;
		width: 100dvw;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: max-content 1fr;
		margin: 0;
		/* https://cssgradient.io/ **/
		background: linear-gradient(
			42deg,
			rgb(83, 21, 124) 0%,
			rgb(191, 17, 17) 50%,
			rgba(208, 146, 58, 1) 100%
		);
	}
</style>
