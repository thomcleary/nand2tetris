<script lang="ts" context="module">
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
</script>

<script lang="ts">
	import { DesktopContext } from '$lib/contexts/DesktopContext.svelte';

	import PepperIcon from '../icons/PepperIcon.svelte';
	import WifiIcon from '../icons/WifiIcon.svelte';

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
		<PepperIcon height="0.8rem" fill="white" />
		{#if DesktopContext.currentApplication}
			<b>{DesktopContext.currentApplication}</b>
		{/if}
	</div>
	<div class="menu-items">
		<WifiIcon height="0.8rem" fill={`rgba(255, 255, 255, ${connection ? '1' : '0.25'})`} />
		<span id="menu-bar-datetime">{dateTime}</span>
	</div>
</div>

<style>
	b {
		font-weight: 800;
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
