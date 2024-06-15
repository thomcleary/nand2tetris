<script lang="ts">
	import '../app.css';

	const { children } = $props();

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
</script>

<div id="menu-bar"><span>🍎<b>nand2tetris</b></span><span>{dateTime}</span></div>
{@render children()}

<style>
	:global(body) {
		height: 100dvh;
		width: 100dvw;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: max-content 1fr;
		margin: 0;
		/* https://cssgradient.io/ **/
		background: rgb(95, 42, 131);
		background: linear-gradient(
			45deg,
			rgba(95, 42, 131, 1) 0%,
			rgba(150, 24, 24, 1) 50%,
			rgba(208, 146, 58, 1) 100%
		);
	}

	b {
		font-weight: 800;
		padding-left: 0.5rem;
	}

	#menu-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.25rem 0.5rem;
		background-color: rgba(0, 0, 0, 0.2);
		color: white;
	}

	b,
	#menu-bar span {
		font-family: var(--font-system);
		font-size: 0.8rem;
	}
</style>
