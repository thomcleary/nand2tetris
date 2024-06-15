<script lang="ts">
	const getLongDate = (date: Date) => {
		const [dayOfWeek, month, day] = date.toString().split(' ');
		return [
			dayOfWeek,
			month,
			day,
			date
				.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
				.toLocaleUpperCase()
		].join(' ');
	};

	let dateTime = $state(getLongDate(new Date()));

	$effect(() => {
		const interval = setInterval(() => (dateTime = getLongDate(new Date())), 1000);
		return () => clearInterval(interval);
	});

	let connection = $state(navigator.onLine);

	$effect(() => {
		const offline = () => (connection = false);
		const online = () => (connection = true);

		window.addEventListener('offline', offline);
		window.addEventListener('online', online);

		return () => {
			window.removeEventListener('offline', offline);
			window.removeEventListener('online', online);
		};
	});
</script>

<div id="menu-bar">
	<div class="menu-items">
		<span>🍐<b>nand2tetris</b></span>
	</div>
	<div class="menu-items">
		<svg
			fill={`rgba(255, 255, 255, ${connection ? '1' : '0.25'})`}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 640 512"
			><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path
				d="M54.2 202.9C123.2 136.7 216.8 96 320 96s196.8 40.7 265.8 106.9c12.8 12.2 33 11.8 45.2-.9s11.8-33-.9-45.2C549.7 79.5 440.4 32 320 32S90.3 79.5 9.8 156.7C-2.9 169-3.3 189.2 8.9 202s32.5 13.2 45.2 .9zM320 256c56.8 0 108.6 21.1 148.2 56c13.3 11.7 33.5 10.4 45.2-2.8s10.4-33.5-2.8-45.2C459.8 219.2 393 192 320 192s-139.8 27.2-190.5 72c-13.3 11.7-14.5 31.9-2.8 45.2s31.9 14.5 45.2 2.8c39.5-34.9 91.3-56 148.2-56zm64 160a64 64 0 1 0 -128 0 64 64 0 1 0 128 0z"
			/></svg
		>
		<span id="menu-bar-datetime">{dateTime}</span>
	</div>
</div>

<style>
	b {
		font-weight: 800;
		padding-left: 0.5rem;
	}

	svg {
		height: 0.8rem;
	}

	.menu-items {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	#menu-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.25rem 1rem;
		background-color: rgba(0, 0, 0, 0.2);
		color: white;
	}

	b,
	#menu-bar span {
		font-family: var(--font-system);
		font-size: 0.8rem;
	}

	#menu-bar-datetime {
		opacity: 0.5;
	}
</style>
