<script lang="ts">
	import { page } from '$app/stores';
	import logo from '$lib/images/svelte-logo.svg';
	import github from '$lib/images/github.svg';

	//$page.url.pathname === '/' ? 'page' : undefined
</script>

<header>
	<nav>
		<a class="nav-block" href="/">
			<i class="fa fa-home" aria-hidden="true"></i>&nbsp;
			<h1>Home</h1>
		</a>
		<a class="nav-block" href="/play">
			<i class="fa fa-gamepad" aria-hidden="true"></i>&nbsp;
			<h1>Play</h1>
		</a>
		<a class="nav-block" href="/ranking">
			<i class="fa fa-trophy" aria-hidden="true"></i>&nbsp;
			<h1>Ranking</h1>
		</a>
		<a class="nav-block" href="/profile">
			<i class="fa fa-user" aria-hidden="true"></i>&nbsp;
			<h1>Profile</h1>
		</a>
	</nav>
</header>

<style>
	nav {
		display: flex;
		justify-content: space-around;
		align-items: center;
		flex-wrap: wrap;
		background-color: rgb(0, 0, 0, 0.3);
		padding: 10px;
	}

	nav .nav-block {
		overflow: hidden;
		text-align: center;
		font-size: 40px;
		color: white;
		width: 200px;
		padding: 10px;
		border-radius: 20px;

		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;

		transition: all ease 1s;
	}

	nav .nav-block:hover {
		background-color: rgb(255, 255, 255, 0.1);
	}

	nav .nav-block h1 {
		margin: 0;
		font-size: 2rem;
	}

	@media screen and (min-width: 1800px) {
		nav .nav-block {
			font-size: 50px;
		}
	}

	@media screen and (max-width: 600px) {
		nav .nav-block {
			font-size: 30px;
		}
	}

	@media screen and (max-width: 460px) {
		nav .nav-block {
			justify-content: start;
			width: 100%;
		}
	}
</style>
