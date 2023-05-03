<script lang="ts">
  import { ChangeUser, GetProfile, type IProfile } from "$lib/adapter/auth";
    import { SnackBar } from "$lib/components/snackbar.store";
  import { getCookie } from "$lib/cookies";
  import { onMount } from "svelte";

  let Profile: IProfile | null;

  onMount(async () => {
    try {
      Profile = await GetProfile(getCookie("auth"))
    } catch (err: any) {
      console.error(err.message);
    }
  });

  async function editprofile() {
    try {
      if (Profile) {
        await ChangeUser(getCookie("auth"), Profile!.username, Profile.description || "");

        SnackBar.visible = true;
        SnackBar.message = "Saved changes to userprofile";
        SnackBar.color = "green";
      } else {
        throw new Error("Profile not loaded");
      }
    } catch (err: any) {
      SnackBar.visible = true;
      SnackBar.message = err.message;
      SnackBar.color = "red"
    } 
  }
</script>

<h1 class="title">Profile</h1>

<div class="main-container">
  {#if Profile}
    <input bind:value="{Profile.username}">
    <div>{Profile.email}</div>
    <input bind:value="{Profile.description}">
    <div>{Profile.title}</div>
    <div>{Profile.ranking}</div>

    <a href="/profile/editpassword">
      Change Password
    </a>

    <button on:click={editprofile}>
      Save Changes
    </button>
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