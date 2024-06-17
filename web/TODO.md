# TODO

## state management

- make the state management sane
  - context at layout level for open window
    - only show currently open app (nand2tetris) in menu bar when window is open
    - <https://joyofcode.xyz/svelte-stores-guide#signals-are-the-future>
    - <https://joyofcode.xyz/svelte-context-with-stores#using-the-context-api>
  - context at page level for currently selected file
    - currently selected file (explorer highlighting)
    - file name
    - file contents
    - setter to change selected file

## cleanup markup and styling

- cleanup component markup
- cleanup component styles
  - move inline styles to style tage where possible
  - organise colours
    - convert all rgb()s into css variables
    - consistent naming convention of css color variables

## file management

- don't have any file in editor on initial load
  - show logo and help message eg "open a file to compile"
- allow closing the currently opened file

## code files

- add jack files
- add vm files
- add asm files

## output

- change from textarea to custom components
  - render tokens with syntax highlighting for token type / symbol
  - render parse tree like and indented list (instead of xml)
  - render vm instructions with syntax highlighting
  - render asm instructions with syntax highlighting
  - render hack instructions with a cool transition in?

## information files

- add jack grammar info (add a file to explorer that displays a component)
- add vm instruction set info (add a file to explorer that displays a component)
- add asm instruction set info (add a file to explorer that displays a component)
- README.md (add file to explorer)
  - list learning resources used (nand2tetris.org)
  - list tech used (svelte/sveltekit)
  - link to github repo / profile

## editor

- replace with a code editor component (external package)

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
