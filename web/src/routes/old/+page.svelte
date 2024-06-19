<script lang="ts">
	import appleTouchLogo from '$lib/assets/images/apple-touch-icon.png';
	import Editor from '$lib/components/nand2tetris/Editor.svelte';
	import Explorer from '$lib/components/nand2tetris/Explorer.svelte';
	import { Directory, File } from '$lib/components/nand2tetris/FileTree.svelte';
	import Footer from '$lib/components/nand2tetris/Footer.svelte';
	import Header from '$lib/components/nand2tetris/Header.svelte';
	import Output from '$lib/components/nand2tetris/Output.svelte';
	import type { ComponentProps } from 'svelte';
	import { quintInOut, quintOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
	import JackCompiler from '../../../../projects/10-11/src/compiler/JackCompiler';
	// import { DesktopContext } from '$lib/contexts/DesktopContext.svelte';

	const { data } = $props();
	const { empty, fizzBuzz } = data;

	const jackCompiler = new JackCompiler();

	let jackFileContents = $state<string>(empty);
	let compilationResult = $derived(jackCompiler.compile({ jackFileContents }));

	let showWindow = $state(false);
	let showDesktop = $state(true);

	let fullscreen = $state(false);
	let outDuration = $state(0);

	const files = [
		new Directory({
			name: 'jack',
			files: [
				new File({ name: 'Main.jack' }),
				new File({ name: 'FizzBuzz.jack' }),
				new File({ name: 'jack-grammar.md' })
			]
		}),
		new Directory({
			name: 'vm',
			files: [
				new File({ name: 'test1.vm' }),
				new File({ name: 'test2.vm' }),
				new File({ name: 'vm-instructions.md' })
			]
		}),
		new Directory({
			name: 'asm',
			files: [
				new File({ name: 'test1.asm' }),
				new File({ name: 'test2.asm' }),
				new File({ name: 'asm-instructions.md' })
			]
		}),
		new File({ name: 'README.md' })
	] as const satisfies ComponentProps<Explorer>['files'];
</script>

{#if showWindow}
	<div
		id="code-window"
		class:fullscreen
		in:scale={{ easing: quintOut, duration: 1000, opacity: 0.5 }}
		out:scale={{ easing: quintInOut, duration: outDuration, opacity: 0.5 }}
		onoutroend={() => {
			if (!showWindow) {
				showDesktop = true;
				// DesktopContext.currentApplication = undefined;
			}
		}}
	>
		<Header
			onWindowButtonClick={(color) => {
				if (color === 'green') {
					fullscreen = !fullscreen;
					return;
				}

				outDuration = color === 'red' ? 0 : 750;
				showWindow = !showWindow;
			}}
		/>
		<div id="code-layout">
			<Explorer
				{files}
				onSelectFile={(fileName) => {
					jackFileContents = fileName === 'Main.jack' ? empty : fizzBuzz;
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
{:else if showDesktop}
	<button
		in:scale={{ duration: outDuration > 0 ? 100 : 0 }}
		onclick={() => {
			showDesktop = false;
			showWindow = true;
			// DesktopContext.currentApplication = 'nand2tetris';
		}}><img src={appleTouchLogo} height={64} width={64} alt="nand2tetris" />nand2tetris</button
	>
{/if}

<style>
	button {
		align-self: center;
		justify-self: center;
		height: 64px;
		width: 64px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0;
		border: none;
		border-radius: 1rem;
		background-color: transparent;
		color: white;
		cursor: pointer;
	}

	#code-window {
		align-self: center;
		justify-self: center;
		display: flex;
		flex-direction: column;
		height: 90%;
		width: min(95%, 2560px);
		background-color: var(--color-bg-dark);
		border: 2px solid var(--color-grey-border);
		border-radius: 0.75rem;
		/* https://shadows.brumm.af **/
		box-shadow:
			2.8px 2.8px 2.2px rgba(0, 0, 0, 0.059),
			6.7px 6.7px 5.3px rgba(0, 0, 0, 0.085),
			12.5px 12.5px 10px rgba(0, 0, 0, 0.105),
			22.3px 22.3px 17.9px rgba(0, 0, 0, 0.125),
			41.8px 41.8px 33.4px rgba(0, 0, 0, 0.151),
			100px 100px 80px rgba(0, 0, 0, 0.21);
		transition:
			height 0.2s,
			width 0.2s;
	}

	#code-window.fullscreen {
		height: 100%;
		width: 100%;
	}

	#code-layout {
		flex: 1;
		display: grid;
		grid-template-columns: min-content 1fr 0.75fr;
		grid-template-areas: 'explorer editor output';
	}

	@media (width <= 1280px) {
		#code-layout {
			grid-template-columns: min-content 1fr;
			grid-template-rows: 1fr 0.66fr;
			grid-template-areas:
				'explorer editor'
				'output output';
		}
	}
</style>
