# TODO

## output

- change from textarea to custom components
  - render vm instructions with syntax highlighting
  - render parse tree like and indented list (instead of xml)
  - fix `Output.svelte` type errors

## cleanup

- organise colors into css variables

## deploy

- deploy to github pages
- test what happens when going to route that doesnt exist
  - 404 page or does the `goto` in `+error.svelte` work?
  - does a fallback need to be set in adapter config? (read docs?)
