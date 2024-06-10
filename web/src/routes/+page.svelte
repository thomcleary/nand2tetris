<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import Explorer from '$lib/components/Explorer.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import Output from '$lib/components/Output.svelte';
	import JackCompiler from '../../../projects/10-11/src/compiler/JackCompiler';

	const { data } = $props();
	const { empty, fizzBuzz } = data;

	const jackCompiler = new JackCompiler();

	let jackFileContents = $state<string>(empty);
	let compilationResult = $derived(jackCompiler.compile({ jackFileContents }));
</script>

<Header />
<div id="code-layout">
	<Explorer
		fileNames={['Main.jack', 'FizzBuzz.jack']}
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

<style>
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
