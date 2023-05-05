<script lang="ts">
  import { SnackBar } from "$lib/components/snackbar.store";
  import { getCookie } from "$lib/cookies";
  import { authSocket, onAuthSock } from "$lib/socket/socket";
  import { onMount } from "svelte";

  // This Page is just for Debug purposes right now, I will create the userinterface later on
  let text: any;
  
  onMount(() => {
    const jwt = getCookie("auth");

    if (jwt) {
      onAuthSock(jwt, () => {

        authSocket.on("connectionError", (error) => {
          $SnackBar.visible = true;
          $SnackBar.message = error;
          $SnackBar.color = "red";
        });

        console.log("Hallo");
      });
    } else {
      $SnackBar.visible = true;
      $SnackBar.message = "Log in to see your Games";
      $SnackBar.color = "red";
    }
  });
</script>

<h1>Play</h1>
<input type="text" bind:value={text} placeholder="type in Gameid">
<a href="/play/game?gameid={text}" on:click={() => console.log(text)}>Redirect to board</a>