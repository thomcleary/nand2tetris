import { browser } from '$app/environment';

export const _$online = () => {
	if (!browser) {
		return () => false;
	}

	let online = $state(navigator.onLine);

	const handleOffline = () => (online = false);
	const handleOnline = () => (online = true);

	$effect(() => {
		window.addEventListener('offline', handleOffline);
		window.addEventListener('online', handleOnline);

		return () => {
			window.removeEventListener('offline', handleOffline);
			window.removeEventListener('online', handleOnline);
		};
	});

	return () => online;
};
