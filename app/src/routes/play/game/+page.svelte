<script lang="ts">
    import { page } from "$app/stores";
    import { Move } from "$lib/adapter/play";
    import { SnackBar } from "$lib/components/snackbar.store";
    import { getCookie } from "$lib/cookies";
    import { pubSocket, onPubSock } from "$lib/socket/socket";
    import type { ICard, IGame } from "$lib/types";
    import { onMount } from "svelte";
    import Card from "./card.svelte";
    import { fade } from "svelte/transition";

  // Read Gameid from URL Parameter
  const gameid = $page.url.searchParams.get('gameid');

  let jwt: string | null;

  let errormsg: any = null;
  let board: IGame;
  let cards_buf: ICard[] = [];

  onMount(() => {
    jwt = getCookie("auth");

    onPubSock(() => {
      pubSocket.emit("subscribeGame", gameid);

      pubSocket.on("gameUpdate", (game) => {
          board = game;
      });
      pubSocket.on("gameUpdateError", (error, exacterror) => {
          errormsg = error;
      });
    });
  })

  $: if (board && board.cards) {
    board.cards.forEach((card, index) => {
      const prevCard = cards_buf[index] || {};
      const discovered = card.discovered;
      if (prevCard.discovered !== discovered) {
        card.rotate = true;
      }
    });

    cards_buf = board.cards.map(card => ({ ...card }));
  }

  async function move(cardid: string) {
    try {
      if (!gameid) {
        $SnackBar.message = "No valid Game";
        $SnackBar.color = "red";
        return;
      }
      await Move(jwt, gameid, cardid);
    } catch (err: any) {
      $SnackBar.message = err.message;
      $SnackBar.color = "red";
    } 
  }
</script>



{#if board && board.cards}
  {#if board.winner_username}
    <div in:fade class="main-banner" style="background-image: linear-gradient(to right, black,darkgreen, darkgreen, black);">
      <h2>The winner is</h2>
      <h1>{board.winner_username}</h1>
    </div>
  {:else if board.draw}
    <div in:fade class="main-banner" style="background-image: linear-gradient(to right, black, gray, gray, black);">
      <h1>Draw</h1>
    </div>
  {/if}

  <div class="main-title">
    <h1>{board.p1_username}</h1>
    <h1> vs </h1>
    <h1>{board.p2_username}</h1>
  </div>
  <div class="main-table">
    <div class="main-board"> 
      {#each board.cards as card}
        <Card card={card} move={move} salt={gameid || ""}/>
      {/each}
    </div>
    <div class="player-table">
      <div class="player-bx">
        <p>{board.p1_username}</p>
      </div>
      <div class="player-bx">
        <p>{board.p2_username}</p>
      </div>
    </div>
  </div>

{:else if errormsg!=null}
  <h1 class="err-title">Error 404</h1>
  <p class="err-msg">{errormsg}</p>
{:else}
  <p class="loading-msg">Loading...</p>
{/if}

<style>
  .main-banner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 200px;
    opacity: 0.8;
    
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .main-banner h1 {
    margin-top: 0;
    font-size: 60px;
    letter-spacing: 15px;
  }

  .main-title {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .main-table {
    display: flex;
    flex-direction: column;

    justify-content: space-between;
    align-items: center;
  }

  .main-table .main-board {
    width: 90%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }

  .main-table .player-table {
    margin-top: 3rem;
    width: 90%;
    min-height: 200px;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }

  .main-table .player-table .player-bx {
    background-color: rgb(0, 0, 0, 0.5);
    border-radius: 12px;
    width: 40%;
    overflow: hidden;
    text-align: center;

    font-size: larger;
  }

  p {
    font-weight: 900;
  }

</style>