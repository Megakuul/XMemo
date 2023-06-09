<script>
    import Citation from '$lib/components/Citation.svelte';
    import Intersecting from '$lib/components/Intersecting.svelte';
	import AnimatedIcon from '$lib/components/AnimatedIcon.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="XMemo Homepage" />
</svelte:head>

<section>
	<h1>XMemo</h1>
	<AnimatedIcon width="280" height="280" color="rgb(255,255,255,0.8)" animationoption="10s ease"/>
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
