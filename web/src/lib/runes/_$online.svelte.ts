export const _$online = () => {
	let online = $state(navigator.onLine);

	$effect(() => {
		const handleOffline = () => (online = false);
		const handleOnline = () => (online = true);

		window.addEventListener('offline', handleOffline);
		window.addEventListener('online', handleOnline);

		return () => {
			window.removeEventListener('offline', handleOffline);
			window.removeEventListener('online', handleOnline);
		};
	});

	return () => online;
};
