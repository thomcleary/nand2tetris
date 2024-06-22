import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		paths: {
			base: '/nand2tetris' // Needs to match repo name to deploy to github pages (see: https://kit.svelte.dev/docs/adapter-static#github-pages)
		},
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			// see: https://kit.svelte.dev/docs/adapter-static
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		})
	}
};

export default config;
