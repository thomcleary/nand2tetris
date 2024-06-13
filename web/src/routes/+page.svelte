<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import Explorer from '$lib/components/Explorer.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import Output from '$lib/components/Output.svelte';
	import { quintOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
	import JackCompiler from '../../../projects/10-11/src/compiler/JackCompiler';

	const { data } = $props();
	const { empty, fizzBuzz } = data;

	const jackCompiler = new JackCompiler();

	let jackFileContents = $state<string>(empty);
	let compilationResult = $derived(jackCompiler.compile({ jackFileContents }));

	let visible = $state(false);
	setTimeout(() => (visible = true));
</script>

{#if visible}
	<div id="code-window" in:scale={{ easing: quintOut, duration: 1000 }}>
		<Header />
		<div id="code-layout">
			<Explorer
				files={[
					{ type: 'file', name: 'Main.jack' },
					{ type: 'file', name: 'FizzBuzz.jack' },
					{ type: 'directory', name: 'test-dir', children: [
						{ type: "file", name: "child1.txt" }, 
						{ type: "file", name: "child2.txt" }, 
						{ type: "directory", name: "test-child-dir", children: [ { type: "file", name: "innerChild.txt"}] }
					]}
				] as const}
				onSelectFile={(fileName) => {
					jackFileContents = fileName === 'Main.jack' ? empty : fizzBuzz ?? empty;
				}}
			/>
			<Editor
				fileContents={jackFileContents}
				onInput={(value) => {
					jackFileContents = value;
				}}
			/>
			<Output {compilationResult} />
		</div>
		<Footer />
	</div>
{/if}

<style>
	#code-window {
		flex: 1;
		display: flex;
		flex-direction: column;
		height: 90%;
		max-width: min(95%, 2560px);
		background-color: var(--color-bg-dark);
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

	#code-layout {
		flex: 1;
		display: grid;
		grid-template-columns: minmax(max-content, 10%) 1fr 0.75fr;
		grid-template-areas: 'explorer editor output';
	}

	@media (width <= 1280px) {
		#code-layout {
			grid-template-columns: minmax(max-content, 10%) 1fr;
			grid-template-rows: auto;
			grid-template-areas:
				'explorer editor'
				'output output';
		}
	}
</style>
