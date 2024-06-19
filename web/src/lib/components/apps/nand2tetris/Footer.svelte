<script>
	import GithubIcon from '$lib/components/icons/GithubIcon.svelte';
</script>

<div>
	<a href="https://github.com/thomcleary" target="_blank" rel="noreferrer"
		><GithubIcon width="1rem" height="1rem" fill="var(--color-white)" /><span>thomcleary</span></a
	>
</div>

<style>
	div {
		grid-area: 'footer';
		display: flex;
		justify-content: flex-start;
		align-items: center;
	}

	a {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 0.5rem;
		padding: 0.4rem 0.8rem;
		border-bottom-left-radius: 0.6rem;
		color: var(--color-white);
		text-decoration: none;
	}

	a:hover {
		background-color: rgb(58, 61, 65);
	}

	a > span {
		font-size: 0.7rem;
	}
</style>
