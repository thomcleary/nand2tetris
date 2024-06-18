<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import Window from '../Window.svelte';

	let {
		...windowProps
	}: Pick<ComponentProps<Window>, 'onClose' | 'onMinimise' | 'onMaximise'> = $props();
</script>

<Window {...windowProps}>
	{#snippet headerCenter()}
		<a href="https://www.nand2tetris.org/" target="_blank" rel="noreferrer">nand2tetris</a>
	{/snippet}
	<h1>nand2tetris</h1>
</Window>

<style>
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
</style>
