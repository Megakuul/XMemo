<script lang="ts">
    import Snackbar from '$lib/components/snackbar.svelte';
	import Navbar from './Navbar.svelte';
	import './styles.css';
</script>

<div class="app">
	<Snackbar />

	<Navbar />

	<main>
		<slot />
	</main>

	<footer>
		<p>Found an issue on this site? Fix it on <a href="https://github.com/Megakuul/XMemo">Github</a></p>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
		color: white;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
