<script>
    import Citation from '$lib/components/Citation.svelte';
    import Intersecting from '$lib/components/Intersecting.svelte';
    import Logo from '$lib/components/Logo.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" 
	content="Welcome to XMemo, the ultimate memory challenge. Play against other players and fight for your place among the best of the best." />
</svelte:head>

<section>
	<h1 style="letter-spacing: 15px;">XMemo</h1>
	<Logo width="280" height="280" color="rgb(255,255,255,0.8)" animationoption="10s ease"/>
</section>

<section style="margin: 30vh 0 30vh 0">
	<Intersecting styleOnDefault="scale: 0.8;" styleOnIntersect="scale: 1;" transition="all ease .5s">
		<Citation author="Linus Mosus" content="The true chiefs are those who have crafted their own platform to showcase their superiority."></Citation>
	</Intersecting>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
		font-size: 10rem;
		font-weight: 600;

		background: var(--title-gradient);
		background-size: 200% 200%;

		user-select: none;
		background-clip: text;
        color: transparent;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;

		transition: all ease .5s;

		animation: gradient-animation 3s linear infinite;
	}

	@keyframes gradient-animation {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}

	@media screen and (max-width: 600px) {
		h1 {
			font-size: 5rem;
		}
	}
</style>
