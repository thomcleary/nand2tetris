<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	// TODO: handle this properly in the specific environment that you deploy to
	// (see static-adapter options like 'fallback')
	if (browser) {
		goto('./');
	}
</script>
