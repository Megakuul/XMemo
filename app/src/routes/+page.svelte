<script>
	import AnimatedIcon from '$lib/components/AnimatedIcon.svelte';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="XMemo Homepage" />
</svelte:head>

<section>
	<h1>XMemo</h1>
	<AnimatedIcon width="300" height="300" color="rgb(255,255,255,0.8)" animationoption="10s ease"/>
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
</style>
