<script lang="ts">
  import { Register } from "$lib/adapter/auth";
    import { SnackBar } from "$lib/components/snackbar.store";

  let username: string;
  let email: string;
  let password: string;

  let error: string | null;

  async function register() {
    try {
      const token = await Register(username, email, password);
      window.location.href = '/profile/signin';
    } catch (err: any) {
      $SnackBar.message = err.message;
      $SnackBar.color = "red";
    } 
  }

</script>

<svelte:head>
	<title>Sign Up</title>
	<meta name="description" 
  content="Join XMemo and start playing memory games against other players. Sign up now to test your memory skills and see how you rank." />
</svelte:head>


<div class="main-form">
  <h1 style="font-size: 50px;">Sign Up</h1>

  <input bind:value={username} type="text" placeholder="Username">

  <input bind:value={email} type="email" placeholder="Email">

  <input bind:value={password} type="password" placeholder="Password">

  <button on:click={register}>
    Submit
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

  @media screen and (max-width: 700px) {
    .main-form {
      width: 80%;
    }

    .main-form input {
      font-size: 1.2rem;
      height: 30px;
    }

    .main-form button {
      font-size: 1rem;
      height: 30px;
    }
  }
</style>