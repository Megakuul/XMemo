<script lang="ts">
  import { ChangeUser, GetProfile, type IProfile } from "$lib/adapter/auth";
  import AnimatedIcon from "$lib/components/AnimatedIcon.svelte";
    import LoadingIcon from "$lib/components/LoadingIcon.svelte";
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
    <button on:click={logout}>
      Logout
    </button>
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
    flex-direction: column;
    align-items: center;
  }

  .profile-container input {
    display: block;
    border: none;
    font: 'Raleway', sans-serif;
    font-size: 2rem;
    background-color: transparent;
    text-align: center;
    color: white;
    overflow: hidden;
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

  .main-form input{
    display: block;
    border: none;
    font: 'Raleway', sans-serif;
    font-size: 2rem;

    background-color: rgba(255,255,255,0.07);
    color: white;

    height: 50px;
    padding: 10px;
    margin: 15px;
    border-radius: 8px;

    transition: all ease .5s;
  }
  .main-form input:focus {
    outline: none;
    box-shadow: 0.2rem 0.8rem 1.6rem rgb(0, 0, 0, 0.5);
  }
  .main-form button {
    height: 50px;
    font-size: 1.8rem;
    padding: 10px;
    margin: 15px;
    border-radius: 8px;
    border: none;

    color: white;
    background-color: rgb(0, 0, 0, 0.3);
    cursor: pointer;
    overflow: hidden;
    
    transition: all ease .5s;
  }
  .main-form button:hover {
    background-color: rgb(0, 0, 0, 0.2);
    color:rgb(255, 255, 255, 0.6);
  }
</style>