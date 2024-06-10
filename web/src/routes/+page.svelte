<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import Explorer from '$lib/components/Explorer.svelte';
	import Output from '$lib/components/Output.svelte';
	import JackCompiler from '../../../projects/10-11/src/compiler/JackCompiler';

	const { data } = $props();
	const { empty, fizzBuzz } = data;

	const jackCompiler = new JackCompiler();

	let jackFileContents = $state<string>(empty);
	let compilationResult = $derived(jackCompiler.compile({ jackFileContents }));
</script>

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
