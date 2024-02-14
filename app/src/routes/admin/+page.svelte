<script lang="ts">
  import { GetConfig, type IConfig } from "$lib/adapter/admin";
  import { onMount } from "svelte";
	import { getCookie } from "$lib/cookies";
	import LoadIcon from "$lib/components/LoadIcon.svelte";
  import { SnackBar } from "$lib/components/snackbar.store";

	let Config: IConfig | null;
  let Loading: boolean = true;

  onMount(async () => {
    try {
      Config = await GetConfig(getCookie("auth"));
    } catch (err: any) {
      $SnackBar.message = err.message;
      $SnackBar.color = "red";
    } finally {
      Loading = false;
    }
  });
</script>

<svelte:head>
	<title>Admin</title>
	<meta name="description" 
  content="XMemo administration console." />
</svelte:head>

{#if Loading}
  <LoadIcon />
{:else if Config}
	<h1 class="title">Admin Console</h1>
	<div class="admin-container">
		<div class="config">
			<h2 class="config-title">Configuration</h2>
			<p title="Number of card pairs distributed (ranked games)">Card Pairs: 
				<input class="inputbx" type="number" max="400" min="1" placeholder="20" bind:value="{Config.rankedcardpairs}">
			</p>
			<p title="Seconds to complete a move (ranked games)">Move Time: 
				<input class="inputbx" type="number" max="1000" min="1" placeholder="20" bind:value="{Config.rankedmovetime}">
			</p>
		</div>
		<div class="titlemap">
			<h2 title="Title configuration based on ranking">Title Map Editor</h2>
			<textarea class="inputbx" placeholder="Titlemap" bind:value="{Config.titlemap}" />
		</div>
	</div>
{:else}
	<h2 class="title" style="margin-bottom: 10vh">Oops! Access Denied.</h2>
{/if}



<style>
	.admin-container {
    display: flex;
    align-self: center;
    flex-direction: row;
		flex-wrap: wrap;
    width: 95%;
    justify-content: space-between;
  }

	.admin-container .inputbx {
    font: 'Raleway', sans-serif;
    overflow: hidden;

		-ms-overflow-style: none;
    scrollbar-width: none; 

		height: 20px;
    padding: 10px;

    background-color: transparent;
    color: white;
    border-radius: 8px;
		border: none;
    font-size: 1rem;
    text-align: center;
		transition: all ease .3s;
  }

	.admin-container .inputbx:focus {
    outline: none;
    box-shadow: inset 0 0 1rem rgb(255, 255, 255, 0.3);
  }

	.admin-container .inputbx::-webkit-scrollbar {
		display: none;
	}

	.admin-container .config,
	.admin-container .titlemap,
  .admin-container .user {
    display: flex;
    flex-direction: column;
		background-color: rgb(255, 255, 255, 0.05);
    border-radius: 12px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px 0px;
  }

  .admin-container .config {
    width: 30%;
  }

	.admin-container .config .config-title {
		text-decoration: underline;
	}

	.admin-container .titlemap {
		margin-top: 1rem;
		width: 100%;
	}

	.admin-container .titlemap .inputbx {
    height: 500px;
    padding: 5px;
    margin: 10px;
    text-align: start;
    resize: none;
    font-size: 1.1rem;
		font-family: 'Ubuntu Mono', sans-serif;
		overflow-y: scroll;
		overflow-x: hidden;
  }
</style>