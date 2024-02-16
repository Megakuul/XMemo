<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
	import { getCookie } from "$lib/helper/cookies";
	import LoadIcon from "$lib/components/LoadIcon.svelte";
  import { SnackBar } from "$lib/components/snackbar.store";

  import { GetConfig, GetUser, UpdateConfig, UpdateUser } from "$lib/adapter/rest/admin";
  import type { AdapterConfig, AdapterUser } from "$lib/adapter/types";
  

	let Config: AdapterConfig | null;
  let Loading: boolean = true;

  let SearchUser: string;
  let CurrentUser: AdapterUser | null;

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

  async function getuser() {
    try {
      CurrentUser = await GetUser(getCookie("auth"), SearchUser);
    } catch (err: any) {
      $SnackBar.message = err.message;
      $SnackBar.color = "red"
    }
  }

  async function updateuser() {
    try {
      if (CurrentUser) {
        const msg = await UpdateUser(getCookie("auth"), CurrentUser)
        $SnackBar.message = String(msg);
        $SnackBar.color = "green";
      }
    } catch (err: any) {
      $SnackBar.message = err.message;
      $SnackBar.color = "red"
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
		<div class="game-config">
			<h2 class="config-title">Game Configuration</h2>
      <div class="options">
        <p title="Number of card pairs distributed (ranked games)">Card Pairs: 
          <input class="input" type="number" max="400" min="1" placeholder="20" bind:value="{Config.rankedcardpairs}">
        </p>
        <p title="Seconds to complete a move (ranked games)">Move Time: 
          <input class="input" type="number" max="1000" min="1" placeholder="20" bind:value="{Config.rankedmovetime}">
        </p>
      </div>
      <div class="titlemap">
        <p>Title Map Editor 
          <button class="add fa fa-plus-square" title="Add title entry" on:click={addtitle} />
        </p>
        {#each Config.titlemap as [k, v], i}
        <div transition:fade class="title-kv">
          <input class="input key" type="number" placeholder="Ranking" bind:value={k}>
          <input class="input value" placeholder="Title" bind:value={v}>
          <button class="delete fa fa-trash" title="Delete title" on:click={() => removetitle(i)}/>
        </div>
        {/each}
      </div>
      <button class="button save" on:click={updateconfig}>
        Save Game Configuration
      </button>
		</div>

    <div class="user-config">
      <h2 class="config-title">User Editor</h2>
      <input class="input" type="text" placeholder="username" bind:value="{SearchUser}">
      <button class="button" on:click={getuser}>Search User</button>
      {#if CurrentUser}
      <div transition:fade class="user">
        <input class="input" type="text" disabled placeholder="User ID" bind:value={CurrentUser.userid}>
        <input class="input" type="text" disabled placeholder="Username" bind:value={CurrentUser.username}>
        <input class="input" type="text" disabled placeholder="Email" bind:value={CurrentUser.email}>
        <input class="input" type="text" disabled placeholder="Ranking" bind:value={CurrentUser.ranking}>
        <input class="input" type="text" placeholder="user|maintainer|admin" bind:value={CurrentUser.role}>
        <button class="button" title="Update User" on:click={updateuser} >
          Update User
        </button>
      </div>
      {/if}
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

  .admin-container .button {
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

  .admin-container .button:hover {
    background-color: rgb(0, 0, 0, 0.2);
    color:rgb(255, 255, 255, 0.6);
  }

  @media screen and (max-width: 600px) {
    .admin-container .button {
      margin: .5rem;
      padding: .5rem;
      font-size: 0.6rem;
    }
  }

	.admin-container .input {
    font: 'Raleway', sans-serif;
    overflow: hidden;

		height: 20px;
    padding: .8rem;
    margin: .8rem;

    background-color: rgba(0, 0, 0, 0.1);
    box-shadow: inset 0 0 10px 1px rgba(0, 0, 0, 0.3);
		font-family: 'Ubuntu Mono', sans-serif;
    color: white;

    border-radius: 8px;
		border: none;
    font-size: 1.4rem;
    text-align: center;
		transition: all ease .3s;
  }

	.admin-container .input:focus {
    outline: none;
    box-shadow: inset 0 0 10px 4px rgba(0, 0, 0, 0.3);
  }

  @media screen and (max-width: 600px) {
    .admin-container .input {
      margin: .5rem;
      padding: .5rem;
      font-size: 0.6rem;
    }
  }

  .admin-container .config-title {
		text-decoration: underline;
	}

	.admin-container .game-config,
  .admin-container .user-config {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin: 1rem;
		background-color: rgb(255, 255, 255, 0.05);
    border-radius: 12px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px 0px;
    padding: 3rem 5% 1.5rem 5%;
    width: 100%;
  }

  .game-config .options {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: space-around;
  }

  .game-config .options * {
    width: 50%;
  }

  .game-config .titlemap {
    align-self: center;
    padding: 2rem;
    width: 100%;
    max-height: 400px;
    border-radius: 8px;
    background-color: rgb(0, 0, 0, 0.05);
    box-shadow: inset 0 0 1rem .3rem rgba(0, 0, 0, 0.2);
    
    overflow-y: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none; 
	}

  .game-config .titlemap::-webkit-scrollbar {
    display: none;
  }

  .game-config .titlemap .add {
    outline: none;
    align-self: center;
    color: rgba(255,255,255,0.5);
    background-color: transparent;
    border: none;
    cursor: pointer;
    transition: all ease .5s;
  }

  .game-config .titlemap .add:hover {
    color: rgba(255,255,255,0.8);
  }

  .game-config .titlemap .title-kv {
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-items: center;
    width: 100%;
  }

	.game-config .titlemap .title-kv .input {
    text-align: start;
  }

  .game-config .titlemap .title-kv .key {
    flex: 4;
  }

  .game-config .titlemap .title-kv .value {
    flex: 8;
  }

  .game-config .titlemap .title-kv .delete {
    outline: none;
    height: 35px;
    width: 35px;
    color: rgba(255,255,255,0.5);
    border-radius: 12px;
    background-color: rgba(255,255,255,0.05);
    cursor: pointer;
  }

  .game-config .save {
    margin-top: 2rem;
  }

  .user-config .user {
    display: flex;
    flex-direction: column;
  }
</style>