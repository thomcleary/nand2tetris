# TODO

## file explorer

- make explorer look like vscode explorer
- separate folders for jack/vm/asm
  - add more code files for jack/vm/asm from projects
- top level files for README and info files (placeholders)
- don't have any file in editor on initial load
  - show logo and help message eg "open a file to compile"
- allow adding new files to the file explorer (saving them to local storage etc)
- allow closing the currently opened file

## output

- change from textarea to custom components
  - render tokens with syntax highlighting for token type / symbol
  - render parse tree like and indented list (instead of xml)
  - render vm instructions with syntax highlighting
  - render asm instructions with syntax highlighting
  - render hack instructions with a cool transition in?

## information files

- add hack/asm/vm/ instruction set info (add a file to explorer that displays a component)
- add jack grammar info (add a file to explorer that displays a component)
- README.md (add file to explorer)

  - list tech used (svelte/sveltekit)
  - list learning resources used (nand2tetris.org)
  - link to github repo / profile

## editor

- allow having multiple tabs open
  - show path to file in top between textare and tab (like vscode)
- add line numbers to editor

## error styling

- make tab color highlighting red when there is an error with that tab
- make the error message appear like what it looks like in vscode PROBLEMS tab
- disable tabs that will not have output (eg, if failure generating vmInstructions, disable .asm/.hack tabs)

## ux

- keyboard shortucts
  - show and hide explorer ctr+b
- syntax highlight output
- style scrollbars to look like vscode to be consistent across browsers / devices
- nicer typing experience in code box
- syntax highlight editor
- highlight code in editor with tokens from tokenizer output (checkbox to toggle on)
  - hover over token shows tooltip with token information

## error messages

- Add line number and info to error messages
- highlight errors in input with squiggle red line?
