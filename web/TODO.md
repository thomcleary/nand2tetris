# TODO

## refactor components and state

- refactor Explorer
  - add side panel buttons back
    - files
    - settings
  - render files as tree
    - add file icons back
    - add file icon to editor tab

## purge

- delete old components / stuff

## file management

- don't have any file in editor on initial load
  - show logo and help message eg "open a file to compile"
- allow closing the currently opened file

## layout

- dynamically adjust grid layouts based on selected file state
  - if no selected file then output area should be 0

## cleanup markup and styling

- (mainly internal nand2tetris components that haven't been touched during refactor)
- cleanup component markup
- cleanup component styles
  - move inline styles to style tage where possible
  - organise colours
    - convert all rgb()s into css variables
    - consistent naming convention of css color variables

## refactor output generation

- move code that generates output result into separate file
- make the return type change based on the file extension of the File being passed in

## editor

- replace with a code editor component (external package)
- only update nand2tetris context with file changes on save
  - keyboard shortcut?

## output

- change from textarea to custom components
  - render tokens with syntax highlighting for token type / symbol
  - render parse tree like and indented list (instead of xml)
  - render vm instructions with syntax highlighting
  - render asm instructions with syntax highlighting
  - render hack instructions with a cool transition in?

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
