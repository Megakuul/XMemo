<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
	import { getCookie } from "$lib/helper/cookies";
	import LoadIcon from "$lib/components/LoadIcon.svelte";
  import { SnackBar } from "$lib/components/snackbar.store";

  import { GetConfig, UpdateConfig } from "$lib/adapter/rest/admin";
  import type { AdapterConfig } from "$lib/adapter/types";
  

	let Config: AdapterConfig | null;
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

  async function updateconfig() {
    try {
      if (Config) {
        const msg = await UpdateConfig(getCookie("auth"), Config);
        $SnackBar.message = String(msg);
        $SnackBar.color = "green";
      }
    } catch (err: any) {
      $SnackBar.message = err.message;
      $SnackBar.color = "red"
    }
  }

  function addtitle() {
    if (Config) {
      // This is required to trigger svelte reactivity
      const titlemapBuf = Config.titlemap;
      titlemapBuf.push(["", ""]);
      Config.titlemap = titlemapBuf;
    }
  }
  function removetitle(index: number) {
    if (Config) {
      // This is required to trigger svelte reactivity
      const titlemapBuf = Config.titlemap;
      titlemapBuf.splice(index, 1);
      Config.titlemap = titlemapBuf;
    }
  }
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
				<input class="inputbx" type="text" max="400" min="1" placeholder="20" bind:value="{Config.rankedcardpairs}">
			</p>
			<p title="Seconds to complete a move (ranked games)">Move Time: 
				<input class="inputbx" type="text" max="1000" min="1" placeholder="20" bind:value="{Config.rankedmovetime}">
			</p>
		</div>
    <div class="savebx">
      <button on:click={updateconfig}>
        Save Config & Title Map
      </button>
		</div>
		<div class="titlemap">
			<h2>Title Map Editor 
        <button class="add fa fa-plus-square" title="Add title entry" on:click={addtitle} />
      </h2>
      {#each Config.titlemap as [k, v], i}
      <div transition:fade class="title-kv">
        <input class="inputbx key" type="number" placeholder="Ranking" bind:value={k}>
        <input class="inputbx value" placeholder="Title" bind:value={v}>
        <button class="delete fa fa-trash" title="Delete title" on:click={() => removetitle(i)}/>
      </div>
      {/each}
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

    background-color: rgba(0, 0, 0, 0.1);
    box-shadow: inset 0 0 10px 1px rgba(0, 0, 0, 0.3);
		font-family: 'Ubuntu Mono', sans-serif;
    color: white;

    border-radius: 8px;
		border: none;
    font-size: 1rem;
    text-align: center;
		transition: all ease .3s;
  }

	.admin-container .inputbx:focus {
    outline: none;
    box-shadow: inset 0 0 10px 4px rgba(0, 0, 0, 0.3);
  }

	.admin-container .inputbx::-webkit-scrollbar {
		display: none;
	}

	.admin-container .config,
	.admin-container .titlemap,
  .admin-container .savebx,
  .admin-container .user {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin: 1rem;
		background-color: rgb(255, 255, 255, 0.05);
    border-radius: 12px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px 0px;
  }

  .admin-container .config {
    padding: 3rem;
  }

	.admin-container .config .config-title {
		text-decoration: underline;
	}

  .admin-container .savebx {
    padding: 1rem;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
  }

  .admin-container .savebx button {
    font-size: 1.4rem;
    margin: 0 15px 0 15px;
    padding: 10px;
    border-radius: 8px;
    border: none;

    font-family: 'Ubuntu Mono', sans-serif;
    color: rgb(255, 255, 255, 0.8);
    background-color: rgb(0, 0, 0, 0.3);
    cursor: pointer;
    overflow: hidden;
    
    transition: all ease .5s;
  }

  .admin-container .savebx button:hover {
    background-color: rgb(0, 0, 0, 0.2);
    color:rgb(255, 255, 255, 0.6);
  }

	.admin-container .titlemap {
		width: 100%;
	}

  .admin-container .titlemap .add {
    outline: none;
    align-self: center;
    color: rgba(255,255,255,0.5);
    background-color: transparent;
    border: none;
    cursor: pointer;
    transition: all ease .5s;
  }

  .admin-container .titlemap .add:hover {
    color: rgba(255,255,255,0.8);
  }

  .admin-container .titlemap .title-kv {
    display: flex;
    align-self: center;
    flex-direction: row;
    justify-content: start;
    align-items: center;
    width: 90%;
  }

	.titlemap .title-kv .inputbx {
    padding: 1rem;
    margin: 1rem;
    text-align: start;
    font-size: 1.6rem;
  }

  @media screen and (max-width: 600px) {
    .titlemap .title-kv .inputbx {
      margin: .5rem;
      padding: .5rem;
      font-size: 0.6rem;
    }
  }

  .titlemap .title-kv .key {
    flex: 4;
  }

  .titlemap .title-kv .value {
    flex: 8;
  }

  .titlemap .title-kv .delete {
    outline: none;
    height: 35px;
    width: 35px;
    color: rgba(255,255,255,0.5);
    border-radius: 12px;
    background-color: rgba(255,255,255,0.05);
    cursor: pointer;
  }
</style>