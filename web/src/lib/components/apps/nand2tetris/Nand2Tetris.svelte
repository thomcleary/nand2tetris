<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import Window from '../Window.svelte';

	let {
		...windowProps
	}: Pick<ComponentProps<Window>, 'onClose' | 'onMinimise' | 'onMaximise'> = $props();
</script>

<Window {...windowProps}>
	{#snippet header()}
		<h1>header</h1>
	{/snippet}
	<h1>nand2tetris</h1>
</Window>
