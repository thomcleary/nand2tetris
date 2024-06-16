<script lang="ts">
	import type { IconProps } from './types';

	let { fileType, ...props }: IconProps & { fileType: string } = $props();
</script>

<!--https://github.com/PKief/vscode-material-icon-theme-->
{#if fileType === 'vm'}
	<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"
		><path
			fill="#0288d1"
			d="M150 61.553A88.446 88.446 0 0 0 61.553 150 88.446 88.446 0 0 0 150 238.446 88.446 88.446 0 0 0 238.446 150 88.446 88.446 0 0 0 150 61.553zm.011 25.082a63.353 63.353 0 0 1 63.353 63.353 63.353 63.353 0 0 1-63.353 63.353 63.353 63.353 0 0 1-63.353-63.353 63.353 63.353 0 0 1 63.353-63.353z"
			paint-order="fill markers stroke"
		/><path
			fill="#0288d1"
			d="M45.008 193.096 12.213 225.89l32.795 32.795V238.44h104.99v-25.098H45.008zM74.088 12.21 41.293 45.006h20.246v104.99h25.098V45.007h20.246zm180.901 29.093V61.55h-104.99v25.097h104.99v20.246L287.784 74.1zM213.32 149.998V254.99h-20.245l32.794 32.795 32.795-32.795h-20.246V150z"
		/></svg
	>
{:else if fileType === 'asm'}
	<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"
		><path
			fill="#ff6e40"
			d="M8 6V2H4a2 2 0 0 0-2 2v24a2 2 0 0 0 2 2h4v-4H4V6Zm16-4v4h4v20h-4v4h4a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Zm-4 4h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Zm-2 6V8h2v4Zm-4 6h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-2 6v-4h2v4Zm0-18c0 2 0 2-2 2v2h2v4h2V6Zm8 12c0 2 0 2-2 2v2h2v4h2v-8Z"
		/></svg
	>
{:else if fileType === 'md'}
	<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"
		><path
			fill="#42a5f5"
			d="m14 10-4 3.5L6 10H4v12h4v-6l2 2 2-2v6h4V10h-2zm12 6v-6h-4v6h-4l6 8 6-8h-4z"
		/></svg
	>
{:else}
	<svg {...props} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
		><path
			d="M13 9h5.5L13 3.5V9M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2m5 2H6v16h12v-9h-7V4z"
			fill="#90a4ae"
		/></svg
	>
{/if}
