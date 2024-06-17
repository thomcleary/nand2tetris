# TODO

## refactor components and state

- `layout.svelte` only for importing `app.css`

  - move any `:global(body)` styles into `app.css`

- `+page.svelte` for creating global contexts

  - context create/get functions in `lib/context/someContext.svelte.ts` files
  - only renders 2 components

  ```svelte
  <script>
  	// create app contexts for desktop
  </script>

  <MenuBar />
  <Desktop />
  ```

  - `MenuBar.svelte` largely unchanged, use `<header>` element instead?

  - `Desktop.svelte`
    - list of applications {component: Component, name: string, icon: Component}[]
    - renders desktop icons if `context.currentApplication` is undefined (each applications as app)
      - will set `context.currentApplication` to app when clicked
    - renders currentApplication if `context.currentApplication` is defined

- `Window.svelte` as container component to wrap applications in

  - `<Window app="nand2tetris" />`

  ```svelte
  <script>
  	let { onClose, onMinimise, onMaximise, heading, children } = $props();
  </script>

  {#snippet windowButtons()}
  	<button onclick={() => { onClose?.(); close();}>red</button>
  	<button onclick={() => { onMinimise?.(); minimise();}>yellow</button>
  	<button onclick={() => { onMaximise?.(); (fullscreen = !fullscreen);}}>green</button>
  {/snippet}

  <div>
  	<header style:display="flex">
  		{@render windowButtons()}
  		{@render heading()}
  	</header>
  	{@render children()}
  </div>
  ```

  - <https://svelte.dev/docs/component-directives#style-props/>

- `Nand2Tetris.svelte` renders the vscode knock off

```svelte
<Window  />
  {#snippet heading()}
    <a>nand2Tetris</a>
  {/snippet}
  <div>
    <div>
      <Explorer />
      <Editor />
      <Output />
    </div>
    <Footer />
  </div>
</Window>

```

## cleanup markup and styling

- (mainly internal nand2tetris components that haven't been touched during refactor)
- cleanup component markup
- cleanup component styles
  - move inline styles to style tage where possible
  - organise colours
    - convert all rgb()s into css variables
    - consistent naming convention of css color variables

## code files

- add jack files
- add vm files
  - only use vmTranslator and assembler (eg. dont show VM tab)
- add asm files
  - only use assembler (eg. dont show VM and ASM tabs)

## editor

- replace with a code editor component (external package)

## file management

- don't have any file in editor on initial load
  - show logo and help message eg "open a file to compile"
- allow closing the currently opened file

## output

- change from textarea to custom components
  - render tokens with syntax highlighting for token type / symbol
  - render parse tree like and indented list (instead of xml)
  - render vm instructions with syntax highlighting
  - render asm instructions with syntax highlighting
  - render hack instructions with a cool transition in?

## information files

- add `jack-grammar.md` (add a file to explorer that displays a component)
- add `vm-instructions.md` (add a file to explorer that displays a component)
- add `asm-instructions.md` (add a file to explorer that displays a component)
- README.md (add file to explorer)
  - list learning resources used (nand2tetris.org)
  - list tech used (svelte/sveltekit)
  - link to github repo / profile

## output error styling

- make tab color highlighting red when there is an error with that tab
- make the error message appear like what it looks like in vscode PROBLEMS tab
- disable tabs that will not have output (eg, if failure generating vmInstructions, disable .asm/.hack tabs)
- Add line number and info to error messages

## persistance

- add a /local-storage folder
  - allow adding files to this folder
  - allow saving to local storage
    - show save icon when changed
    - closing tab when not saved shows alert to save or not
    - ctrl+s saves the file
  - allow deleting files from local storage folder

## search

- allow searching files

## settings

- TODO ideas

## other

- highlight errors in input with squiggle red line?
