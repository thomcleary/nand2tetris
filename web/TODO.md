# TODO

## explorer styling

- make explorer look like vscode explorer
  - style file names like vscode (selected / unselected / hover etc.)
  - file icons in explorer and tabs

## state management

- make the state management sane
  - context at layout level for open window
    - only show currently open app (nand2tetris) in menu bar when window is open
  - context at page level for currently selected file
    - file contents
    - file name
    - compilation result
    - setter to change selected file

## file management

- don't have any file in editor on initial load
  - show logo and help message eg "open a file to compile"
- allow closing the currently opened file
- add more files/folders
  - separate folders for project 6/7/8/10/11
  - separete folder for /examples
    - Main.jack (empty class)
    - FizzBuzz.jack
    - Vm examples
    - Asm examples
  - top level files for README and info files for asm/vm/jack (placeholders)

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

- change theme
  - light
  - dark
- change font

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
