<script lang="ts">
  import { page } from "$app/stores";
  import { pubSocket, onPubSock } from "$lib/socket/socket";
  import type { IGame } from "$lib/types";

  // Read Gameid from URL Parameter
  const gameid = $page.url.searchParams.get('gameid');

  onPubSock(() => {
    pubSocket.emit("subscribeGame", gameid);

    pubSocket.on("gameUpdate", (game) => {
        board = game;
    });
    pubSocket.on("gameUpdateError", (error, exacterror) => {
        errormsg = error;
    });
  });


  let errormsg: any = null;
  let board: IGame;
</script>

<div class="main-board">
  {#if board && board.cards}
    {#each board.cards as card}
      <h1>{card.discovered}</h1>
    {/each}
  {:else if errormsg!=null}
    <h1 class="err-title">Error 404</h1>
    <p class="err-msg">{errormsg}</p>
  {:else}
    <p class="loading-msg">Loading...</p>
  {/if}
</div>


<style>
  .main-board {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;
  }
</style>