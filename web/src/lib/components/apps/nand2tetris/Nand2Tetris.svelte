<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import Window from '../Window.svelte';
	import Footer from './Footer.svelte';

	let {
		...windowProps
	}: Pick<ComponentProps<Window>, 'onClose' | 'onMinimise' | 'onMaximise'> = $props();
</script>

<Window {...windowProps}>
	{#snippet headerCenter()}
		<a class="header-link" href="https://www.nand2tetris.org/" target="_blank" rel="noreferrer"
			>nand2tetris</a
		>
	{/snippet}
	<div class="nand2tetris">
		<h1 style:background-color="red" style:grid-area="explorer">explorer</h1>
		<h1 style:background-color="green" style:grid-area="editor">editor</h1>
		<h1 style:background-color="blue" style:grid-area="output">output</h1>
		<Footer />
	</div>
</Window>

<style>
	h1 {
		color: white;
		margin: 0;
	}

	.header-link {
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

	.header-link:hover {
		color: rgb(159, 165, 179);
		border: 1px solid rgb(69, 73, 80);
	}

	.nand2tetris {
		display: grid;
		grid-template-columns: min-content 1fr 0.75fr;
		grid-template-rows: 1fr min-content;
		grid-template-areas:
			'explorer editor output'
			'footer footer footer';
	}

	@media (width <= 1280px) {
		.nand2tetris {
			grid-template-columns: min-content 1fr;
			grid-template-rows: 1fr 0.66fr min-content;
			grid-template-areas:
				'explorer editor'
				'output output'
				'footer footer';
		}
	}
</style>
