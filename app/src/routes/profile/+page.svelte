<script lang="ts">
  import { ChangeUser, GetProfile, type IProfile } from "$lib/adapter/auth";
  import LoadingIcon from "$lib/components/LoadingIcon.svelte";
    import { getRankingColor } from "$lib/components/rankingcolor";
  import { SnackBar } from "$lib/components/snackbar.store";
  import { deleteCookie, getCookie } from "$lib/cookies";
  import { onMount } from "svelte";

  let Profile: IProfile | null;
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
        await ChangeUser(getCookie("auth"), Profile!.username, Profile.description || "");

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

{#if Loading}
  <LoadingIcon />
{:else if Profile}
  <h1 class="title">Profile</h1>
  <div class="profile-container">
    <div class="profile">
      <p>{Profile.email}</p>
      <input class="inputbx username" placeholder="Username" bind:value="{Profile.username}">
      <textarea class="inputbx description" placeholder="Description" bind:value="{Profile.description}" />
    </div>
    <div class="information">
      <div class="stats">
        <div class="ranking" 
        style="color: {getRankingColor(Number(Profile.ranking))};">
        {Profile.ranking}</div>
        <div class="rank-title">{Profile.title}</div>
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
    height: 400px;
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
    font-size: 2rem;
    text-align: center;
  }

  .profile .description {
    height: 100%;
    text-align: center;
    resize: none;
    font-size: 1rem;
  }

  .profile .inputbx {
    margin: 20px;
    padding: 5px;

    border: none;
    font: 'Raleway', sans-serif;
    overflow: hidden;

    background-color: transparent;
    color: white;
    border-radius: 8px;
  }

  .profile .inputbx:focus {
    outline: none;
    box-shadow: 0.2rem 0.8rem 1.6rem rgb(0, 0, 0, 0.5);
  }


  .profile-container .information {
    justify-content: space-between;
    width: 40%;
  }

  .profile-container .information .stats,
  .profile-container .information .options {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 45%;
    background-color: rgb(255, 255, 255, 0.05);
    border-radius: 12px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px 0px;
  }

  .profile-container .information .stats {
    justify-content: center;
    align-items: center;
    padding: 10px;
  }

  .information .stats .ranking {
    font-size: 3rem;
  }

  .information .stats .rank-title {
    font-size: 1.5rem;
  }

  .profile-container .information .options {
    justify-content: space-around;
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