<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import { getRankingColor } from "$lib/components/rankingcolor";
  import { SnackBar } from "$lib/components/snackbar.store";

  import { onPubSock } from "$lib/adapter/socket/pubsock";
  import { onAuthSock } from "$lib/adapter/socket/authsock";
  import { JoinQueue } from "$lib/adapter/rest/play";
  import type { AdapterGame, AdapterGameQueue } from "$lib/adapter/types";
  import type { Socket } from "socket.io-client";
  import { getCookie, setCookie } from "$lib/helper/cookies";
  import { GetSocketToken } from "$lib/adapter/rest/auth";
  
  
  let currentGames: AdapterGame[] = [];

  let gameQueue: AdapterGameQueue[] = [];

  let jwt: string | null;

  let cleanPubSock: any;
  let cleanAuthSock: any;

  onMount(async () => {
    // Check if socket token is in cookie
    jwt = getCookie("sockauth");
    if (!jwt) {
      // If not, try to get a socket token from the api
      try {
        jwt = await GetSocketToken();
        // If jwt is acquired from api, set it to cookie
        if (jwt) setCookie("sockauth", jwt, 7);
      } catch (err) {
        // If token cannot be acquired, just skip it
        jwt = null;
      }
    }
    // If socket token is found, connect AuthSocket
    if (jwt) {
      cleanAuthSock = onAuthSock(jwt, (authSocket: Socket) => {

        authSocket.on("connectionError", (error) => {
          $SnackBar.message = error;
          $SnackBar.color = "red";
        });

        authSocket.emit("subscribeCurrentGames");

        authSocket.on("currentGamesUpdate", (game) => {
          if (!currentGames.includes(game)) {
            currentGames = [ game, ...currentGames];
          }
        });

        authSocket.on("currentGamesUpdateError", (error) => {
          $SnackBar.message = error.message;
          $SnackBar.color = "red";
        });
      });
    }

    cleanPubSock = onPubSock((pubSocket: Socket) => {
      pubSocket.emit("subscribeQueue");

      pubSocket.on("queueUpdate", (queue) => {
        gameQueue = queue;
      });
    });
  });

  onDestroy(() => {
    if (cleanAuthSock) {
      cleanAuthSock();
    }
    if (cleanPubSock) {
      cleanPubSock();
    }
  });

  async function joinQueue() {
    if (!jwt) {
      $SnackBar.message = "Log in to Queue";
      $SnackBar.color = "red";
      return
    }
    try {
      let queueMessage = await JoinQueue();
      $SnackBar.message = queueMessage;
      $SnackBar.color = "green";
    } catch (err: any) {
      $SnackBar.message = err.message;
      $SnackBar.color = "red";
    } 
  }
</script>

<svelte:head>
	<title>Play</title>
	<meta name="description" 
  content="Ready to put your memory to the test? Play XMemo and challenge other players to see who will grab that win." />
</svelte:head>

<h1 class="title">
  Play XMemo
</h1>
<div class="main-container">
  <div class="games-table">
    {#if jwt}
    <div class="game game-title">
      <p class="gameplayers">Players</p>
      <p class="moves">Moves</p>
    </div>
    {#each currentGames as game}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div class="game" title="{game._id}" class:finished={game.game_stage==-1}
        on:click={() => window.location.href=`/play/game?gameid=${game._id}`}>
        <p class="gameplayers">{game.player1.username} vs {game.player2.username}</p>
        <p class="moves">{game.moves}</p>
      </div>
    {/each}
    {:else}
      <h2>Log in to see your Games</h2>
    {/if}
  </div>
  <div class="queue-table">
    <button on:click={joinQueue}><p>Queue</p></button>
    <p>Waiting: {gameQueue.length}</p>
    <div class="queue">
      {#if gameQueue.length > 0}
      {#each gameQueue as queueObj}
        <div class="queue-element">
          <p>{queueObj.username}</p>
          <p style="color: {getRankingColor(queueObj.ranking)}">
            {queueObj.ranking}
          </p>  
        </div>
      {/each}
      {:else}
        <p>No one is waiting</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .main-container {
    display: flex;
    flex-direction: row;
    height: 500px;
  }

  .main-container .queue-table {
    flex: 3;
    background-color: rgb(255, 255, 255, 0.04);
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px 0px;
    border-radius: 12px;
    margin: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .main-container .queue-table button {
    margin-top: 24px;
    width: 80%;
    height: 100px;
    background-color: rgb(0, 0, 0, 0.6);
    cursor: pointer;
    color: white;
    border-radius: 12px;
    border: none;

    transition: all ease 1s;
  }

  .main-container .queue-table button:hover {
    background-color: rgb(0, 0, 0, 0.4);
  }

  .main-container .queue-table .queue {
    height: 100%;
    width: 90%;
    overflow-y: scroll;
    margin: 10px;
    background-color: rgb(255, 255, 255, 0.1);
    border-radius: 12px;
    display: flex;
    flex-direction: column;

    scrollbar-width: none;
  }

  .main-container .queue-table .queue::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }

  .queue .queue-element {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }

  .queue .queue-element p {
    max-width: 40%;
    overflow: hidden;
  }

  .main-container .games-table {
    flex: 8;
    background-color: rgb(255, 255, 255, 0.04);
    border-radius: 12px;
    overflow-y: scroll;
    margin: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;

    scrollbar-width: none;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px 0px;
  }

  .main-container .games-table::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }

  .games-table .game {
    width: 90%;
    margin: 13px;
    padding: 5px;
    border-radius: 12px;
    background-color: rgb(255, 255, 255, 0.1);
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px 0px;

    display: flex;
    flex-direction: row;
    justify-content: space-around;
    flex-wrap: wrap;

    cursor: pointer;
    transition: all ease 1s;
  }

  .games-table .finished {
    background-color: rgb(0, 0, 0, 0.1);
    filter: brightness(50%);
  }

  .games-table .game-title {
    background-color: transparent;
    box-shadow: none;
  }

  .games-table .game:hover {
    scale: 0.98;
  }

  .games-table .game .gameplayers {
    width: 60%;
    overflow: hidden;
  }

  .games-table .game .moves {
    width: 40%;
    overflow: hidden;
  }

  @media screen and (max-width: 600px) {
    .main-container {
      flex-direction: column;
    }
  }
</style>