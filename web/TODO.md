# TODO

## output

- change from textarea to custom components
  - render tokens with syntax highlighting for token type / symbol
  - render parse tree like and indented list (instead of xml)
  - render vm instructions with syntax highlighting
  - render asm instructions with syntax highlighting
  - render hack instructions with a cool transition in?

## output error styling

- make tab color highlighting red when there is an error with that tab
- make the error message appear like what it looks like in vscode PROBLEMS tab
- disable tabs that will not have output (eg, if failure generating vmInstructions, disable .asm/.hack tabs)

## editor

- replace with a code editor component (external package)
- only update nand2tetris context with file changes on save
  - keyboard shortcut?

## information files

- add `/docs` folder to $lib/assets/files
  - add `jack-grammar.md`
  - add `vm-instructions.md`
  - add `asm-instructions.md`
- add README.md to $liba/assets/files
  - list learning resources used (nand2tetris.org)
  - list tech used (svelte/sveltekit)
  - link to github repo / profile
- show markdown file content in output as rendered html
  - dont show editor (readonly)

## settings

- Theme selector
  - Cleanup css color variables
  - Create 3 themes from css variables that can be toggled

## deploy

- deploy to github pages
- test what happens when going to route that doesnt exist
  - 404 page or does the `goto` in `+error.svelte` work?
  - does a fallback need to be set in adapter config? (read docs?)
