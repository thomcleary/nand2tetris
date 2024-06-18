export const _$dateTime = () => {
	let dateTime = $state(getLongDate(new Date()));

	$effect(() => {
		const interval = setInterval(() => (dateTime = getLongDate(new Date())), 1000);
		return () => clearInterval(interval);
	});

	return () => dateTime;
};

const getLongDate = (date: Date) => {
	const [dayOfWeek, month, day] = date.toString().split(' ');
	return [
		dayOfWeek,
		month,
		day,
		date
			.toLocaleTimeString([], {
				hour: 'numeric',
				minute: '2-digit',
				hour12: true
			})
			.toLocaleUpperCase()
	].join(' ');
};
