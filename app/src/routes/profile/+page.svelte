<script lang="ts">
  import { onMount } from "svelte";
  import LoadIcon from "$lib/components/LoadIcon.svelte";
  import { SnackBar } from "$lib/components/snackbar.store";
  import { getRankingColor } from "$lib/components/rankingcolor";
  import { deleteCookie, getCookie } from "$lib/helper/cookies";
  
  import { ChangeUser, GetProfile } from "$lib/adapter/rest/auth";
  import type { AdapterProfile } from "$lib/adapter/types";

  let Profile: AdapterProfile | null;
  let Loading: boolean = true;

  onMount(async () => {
    try {
      Profile = await GetProfile(getCookie("auth"))
    } catch (err: any) {
      $SnackBar.message = err.message;
      $SnackBar.color = "red";
    } finally {
      Loading = false;
    }
  });

  async function editprofile() {
    try {
      if (Profile) {
        if (Profile.username=="") {
          $SnackBar.message = "Enter a username";
          $SnackBar.color = "red";
          return;
        }
        await ChangeUser(
          getCookie("auth"),
          Profile!.username,
          Profile.description || "",
          Profile.displayedgames || 10
        );

        $SnackBar.message = "Saved changes to userprofile";
        $SnackBar.color = "green";
      } else {
        throw new Error("Profile not loaded");
      }
    } catch (err: any) {
      $SnackBar.message = err.message;
      $SnackBar.color = "red"
    } 
  }

  function logout() {
    deleteCookie("auth");
    location.reload();
  }
</script>

<svelte:head>
	<title>Profile</title>
	<meta name="description" 
  content="View and edit your XMemo profile. Keep track of your stats and achievements as you play and improve your memory skills." />
</svelte:head>

{#if Loading}
  <LoadIcon />
{:else if Profile}
  <h1 class="title">Profile</h1>
  <div class="profile-container">
    <div class="profile">
      <p>{Profile.email}</p>
      <input class="inputbx username" placeholder="Username" bind:value="{Profile.username}">
      <textarea class="inputbx description" placeholder="Description" bind:value="{Profile.description}" />
      <div class="options">
        <p title="Number of games displayed in Play panel">Displayed Games: 
          <input class="inputbx displayedgames" type="number" max="99" min="1" bind:value="{Profile.displayedgames}">
        </p>
      </div>
    </div>
    <div class="information">
      <div class="stats">
        <div class="ranking" 
        style="color: {getRankingColor(Number(Profile.ranking))};">
        {Profile.ranking}</div>
        <div class="rank-title">{Profile.title}</div>
      </div>
      <div class="role" title="{Profile.role=="user" ? "Your role does not allow Admin Console access!" : ""}">
        <p class="role-text">Role:</p>
        <p class="role-title">{Profile.role}</p>
        <a class="role-console-box" class:disabled={Profile.role=="user"}
          href="/admin">Admin Console
        </a>
      </div>
      <div class="options">
        <button on:click={() => window.location.href=`/profile/editpassword`}>
          Change Password
        </button>
        <button on:click={editprofile}>
          Save Changes
        </button>
        <button on:click={logout}>
          Logout
        </button>
      </div>
    </div>
  </div>
{:else}
  <h2 class="title" style="margin-bottom: 10vh">Oops! You're not signed in yet.</h2>
  <div class="noprofile-container">
    <a class="btn" href="/profile/signin">
      Sign In
    </a>
    <a class="btn" href="/profile/signup">
      Sign Up
    </a>
  </div>
{/if}


<style>
  .profile-container {
    display: flex;
    align-self: center;
    flex-direction: row;
    width: 95%;
    height: 450px;
    justify-content: space-between;
  }

  .profile-container .information,
  .profile-container .profile {
    display: flex;
    flex-direction: column;
  }

  .profile-container .profile {
    width: 55%;
    background-color: rgb(255, 255, 255, 0.05);
    border-radius: 12px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px 0px;
  }

  .profile .username {
    height: 100px;
    padding: 20px;
    margin: 10px;
    font-size: 2rem;
    text-align: center;
  }

  .profile .description {
    height: 100%;
    padding: 5px;
    margin: 10px;
    text-align: center;
    resize: none;
    font-size: 1rem;
  }

  .profile .options {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }

  .profile .options p {
    font-size: 1rem;
    user-select: none;
  }

  .profile .options .displayedgames {
    height: 20px;
    padding: 10px;
    font-size: 1rem;
    text-align: center;
    border: none;
  }

  .profile .inputbx {
    border: none;
    font: 'Raleway', sans-serif;
    overflow: hidden;

    background-color: transparent;
    color: white;
    border-radius: 8px;

    transition: all ease .3s;
  }

  .profile .inputbx:focus {
    outline: none;
    box-shadow: inset 0 0 1rem rgb(255, 255, 255, 0.3);
  }

  .profile-container .information {
    justify-content: space-between;
    width: 40%;
  }

  .profile-container .information .stats,
  .profile-container .information .options,
  .profile-container .information .role {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: rgb(255, 255, 255, 0.05);
    border-radius: 12px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px 0px;
  }

  .profile-container .information .stats {
    justify-content: center;
    align-items: center;
    padding: 10px;
    height: 38%;
  }

  .information .stats .ranking {
    font-size: 3rem;
  }

  .information .stats .rank-title {
    font-size: 1.5rem;
  }

  .profile-container .information .role {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px 10px 20px;
    height: 10%;
  }

  .information .role .role-text {
    flex: 1;
  }

  .information .role .role-title {
    flex: 1;
    margin-right: .5rem;
  }

  .information .role .role-console-box {
    flex: 4;
    font-size: 1.2rem;
    text-align: center;
    color: inherit;
    padding: 13px;
    border-radius: 12px;
    background-color: rgba(0, 0, 0, 0.3);
    transition: all ease .3s;
  }

  .information .role .role-console-box:hover {
    text-decoration: underline;
    background-color: rgba(0, 0, 0, 0.4);
  }

  .information .role .role-console-box.disabled {
    text-decoration: line-through;
    pointer-events: none;
    color: rgba(255,255,255,0.5);
    background-color: rgb(169, 169, 169, 0.3);
  }

  @media screen and (max-width: 600px) {
    .information .role .role-console-box {
      font-size: 0.6rem;
    }
  }

  .profile-container .information .options {
    justify-content: space-around;
    height: 38%;
  }

  .information .options button {
    font-size: 1.2rem;
    margin: 0 15px 0 15px;
    padding: 10px;
    border-radius: 8px;
    border: none;

    color: white;
    background-color: rgb(0, 0, 0, 0.3);
    cursor: pointer;
    overflow: hidden;
    
    transition: all ease .5s;
  }
  .information .options button:hover {
    background-color: rgb(0, 0, 0, 0.2);
    color:rgb(255, 255, 255, 0.6);
  }

  @media screen and (max-width: 600px) {
    .information .options button {
      font-size: 0.6rem;
    }
  }

  .noprofile-container {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
  }

  .noprofile-container .btn {
    background-color: rgb(255, 255, 255, 0.05);
    color: white;
    border-radius: 12px;
    transition: all ease 1s;

    display: flex;
    align-items: center;
    justify-content: center;

    margin: 40px;
    font-size: 2rem;
    font-weight: 800;
    width: 300px;
    height: 100px;

    user-select: none;
  }

  .noprofile-container .btn:hover {
    background-color: rgb(0, 0, 0, 0.3);
  }

  @media screen and (max-width: 700px) {
    .noprofile-container {
      flex-direction: column;
    }

    .noprofile-container .btn {
      margin: 10px;
      width: 200px;
      height: 60px;
      font-size: 1rem;
    }
  }

  @media screen and (min-width: 1600px) {
    .noprofile-container .btn {
      width: 400px;
      height: 120px;
      font-size: 3rem;
    }
  }
</style>