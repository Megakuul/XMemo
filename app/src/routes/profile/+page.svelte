<script lang="ts">
  import { GetProfile, type IProfile } from "$lib/adapter/auth";
  import { getCookie } from "$lib/cookies";
  import { onMount } from "svelte";

  let Profile: IProfile | null;

  onMount(async () => {
    try {
      Profile = await GetProfile(getCookie("auth"))
    } catch (err: any) {
      console.error("Von Messias" + err.message);
    }
  });
</script>

<h1 class="title">Profile</h1>


<div class="main-container">
  {#if Profile}
    <div>{Profile.username}</div>
    <div>{Profile.email}</div>
    <div>{Profile.description || ""}</div>
    <div>{Profile.title}</div>
    <div>{Profile.ranking}</div>
  {:else}
    <a href="/profile/signin">
      Sign In
    </a>
    <a href="/profile/signup">
      Sign Up
    </a>
  {/if}
</div>

<style>
  .main-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>