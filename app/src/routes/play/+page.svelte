<script lang="ts">
  import { JoinQueue } from "$lib/adapter/play";
  import { SnackBar } from "$lib/components/snackbar.store";
  import { getCookie } from "$lib/cookies";
  import { authSocket, onAuthSock, onPubSock, pubSocket } from "$lib/socket/socket";
  import { onMount } from "svelte";
  
  let currentGames: any[] = [];

  let gameQueue: any[] = [];

  let jwt: string | null;

  onMount(() => {
    jwt = getCookie("auth");
    if (jwt) {
      onAuthSock(jwt, () => {

        authSocket.on("connectionError", (error) => {
          $SnackBar.message = error;
          $SnackBar.color = "red";
        });

        authSocket.emit("subscribeCurrentGames");

        authSocket.on("currentGamesUpdate", (game) => {
          if (!currentGames.includes(game)) {
            currentGames = [...currentGames, game];
          }
        });

        authSocket.on("currentGamesUpdateError", (error) => {
          $SnackBar.message = error.message;
          $SnackBar.color = "red";
        });
      });
    } else {
      $SnackBar.message = "Log in to see your Games";
      $SnackBar.color = "red";
    }

    onPubSock(() => {
      pubSocket.emit("subscribeQueue");

      pubSocket.on("queueUpdate", (queue) => {
        gameQueue = queue;
      });
    });
  });

  async function joinQueue() {
    try {
      let queueMessage = await JoinQueue(jwt);
      $SnackBar.message = queueMessage;
      $SnackBar.color = "green";
    } catch (err: any) {
      $SnackBar.message = err.message;
      $SnackBar.color = "red";
    } 
  }
</script>

<h1>Play</h1>

<button on:click={joinQueue}>Queue</button>

<div class="current-games">
  {#each currentGames as game}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div on:click={() => window.location.href = `/play/game?gameid=${game._id}`}>{game._id}</div>
  {/each}
</div>

<h2>Queue</h2>
<div class="queue">
  {#each gameQueue as queueObj}
    <div>{queueObj.username}</div>
  {/each}
</div>