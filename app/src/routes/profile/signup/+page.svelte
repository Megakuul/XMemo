<script lang="ts">
  import { Register } from "$lib/adapter/auth";

  let username: string;
  let email: string;
  let password: string;

  let error: string | null;

  async function register() {
    try {
      const token = await Register(username, email, password);
      window.location.href = '/profile/signin';
    } catch (err: any) {
      error = err.message;
    } 
  }

  function resetForm() {
    username = "";
    password = "";
    email = "";

    error = null;
  }

</script>

{#if !error}
  <h1 class="title">Sign Up</h1>

  <input bind:value={username} type="text" placeholder="Username">

  <input bind:value={email} type="email" placeholder="Email">

  <input bind:value={password} type="password" placeholder="Password">

  <button on:click={register}>
    Click
  </button>
{:else}
  <h1 class="err-title">Try Again</h1>
  <h2 class="err-msg">{error}</h2>
  <button on:click={resetForm}>Try again</button>
{/if}