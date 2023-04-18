<script lang="ts">
  import { Login } from "$lib/adapter/auth";
  import { setCookie } from "$lib/cookies";

  let username: string;
  let password: string;

  let error: string | null;

  async function getToken() {
    try {
      const token = await Login(username, password);
      setCookie("auth", token, 7);
      window.location.href = '/profile';
    } catch (err: any) {
      error = err.message;
    } 
  }

  function resetForm() {
    username = "";
    password = "";

    error = null;
  }

</script>

{#if !error}
  <h1 class="title">Sign In</h1>

  <input bind:value={username} type="text" placeholder="Username">

  <input bind:value={password} type="password" placeholder="Password">

  <button on:click={getToken}>
    Click
  </button>
{:else}
  <h1 class="err-title">{error}</h1>
  <button on:click={resetForm}>Try again</button>
{/if}
