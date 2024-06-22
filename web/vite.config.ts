import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	// https://github.com/touchifyapp/svelte-codemirror-editor?tab=readme-ov-file#usage-with-vite--svelte-kit
	optimizeDeps: {
		exclude: ['svelte-codemirror-editor', 'codemirror', '@codemirror/language-javascript']
	},
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
