export const _$online = () => {
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
