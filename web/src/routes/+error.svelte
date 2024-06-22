<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	// adapter-static 'fallback' setup to return 404.html
	if (browser && $page.status === 404) {
		goto('./');
	}
</script>
