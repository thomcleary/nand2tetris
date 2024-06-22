<script lang="ts">
	import Desktop from '$lib/components/desktop/Desktop.svelte';
	import MenuBar from '$lib/components/desktop/MenuBar.svelte';
	import { setFinder } from '$lib/components/desktop/context.svelte.js';

	const { data } = $props();

	setFinder({ files: data.files });

	let currentApp = $state<string>();
</script>

<div class="screen">
	<MenuBar {currentApp} />
	<Desktop onOpenApp={(app) => (currentApp = app)} onCloseApp={() => (currentApp = undefined)} />
</div>

<style>
	.screen {
		min-height: 100dvh;
		min-width: 100dvw;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: min-content 1fr;

		/* https://cssgradient.io/ **/
		background: linear-gradient(
			42deg,
			rgb(83, 21, 124) 0%,
			rgb(191, 17, 17) 50%,
			rgba(208, 146, 58, 1) 100%
		);
	}
</style>
