<script lang="ts">
  import { SnackBar } from "$lib/components/snackbar.store";
  import { Login, LoginOIDC } from "$lib/adapter/rest/auth";

  let username: string;
  let password: string;

  async function getTokenFromCredentials() {
    try {
      await Login(username, password);
      window.location.href = '/profile';
    } catch (err: any) {
      $SnackBar.message = err.message;
      $SnackBar.color = "red";
      resetForm();
    } 
  }

  function getTokenFromOIDC() {
    LoginOIDC();
  }

  function resetForm() {
    password = "";
  }

</script>

<svelte:head>
	<title>Sign In</title>
	<meta name="description" 
  content="Already have an XMemo account? Sign in here to start playing and testing your memory skills." />
</svelte:head>


<div class="main-form">
  <h1 style="font-size: 50px;">Sign In</h1>

  <input class="input" bind:value={username} type="text" placeholder="Username">

  <input class="input" bind:value={password} type="password" placeholder="Password">

  <button class="button" on:click={getTokenFromCredentials}>
    Submit
  </button>

  <button class="link" on:click={getTokenFromOIDC}>
    Login with OpenID Connect
  </button>
</div>


<style>
  .main-form {
    display: flex;
    align-self: center;
    justify-self: center;
    flex-direction: column;

    margin: 100px 20px 20px 20px;
    padding: 20px;
    max-height: 700px;
    min-height: 500px;
    background-color: rgb(255, 255, 255, 0.04);
    border-radius: 25px;
    user-select: none;
  }

  .main-form .input{
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
  .main-form .input:focus {
    outline: none;
    box-shadow: 0.2rem 0.8rem 1.6rem rgb(0, 0, 0, 0.5);
  }
  .main-form .button {
    height: 55px;
    font-size: 1.8rem;
    padding: 10px;
    margin: 15px;
    border-radius: 8px;
    border: none;

    color: rgb(255, 255, 255, 0.8);
    background-color: rgb(0, 0, 0, 0.3);
    cursor: pointer;
    overflow: hidden;
    
    transition: all ease .5s;
  }
  .main-form .button:hover {
    background-color: rgb(0, 0, 0, 0.2);
    color:rgb(255, 255, 255, 0.6);
  }

  .main-form .link {
    margin: 15px;
    background-color: transparent;
    color: rgb(255, 255, 255, 0.8);

    cursor: pointer;
    border: none;

    font-weight: 700;
    font-size: 1.2rem;
    text-decoration: underline;
    transition: all ease .5s;
  }
  .main-form .link:hover {
    color: white;
    word-spacing: 1px;
  }

  @media screen and (max-width: 700px) {
    .main-form {
      width: 80%;
    }

    .main-form .input {
      font-size: 1.2rem;
      height: 30px;
    }

    .main-form .button {
      font-size: 1rem;
      height: 30px;
    }

    .main-form .link {
      font-size: 0.6rem;
    }
  }
</style>