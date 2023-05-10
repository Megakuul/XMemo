<script lang="ts">
    import { page } from "$app/stores";
    import { Move } from "$lib/adapter/play";
    import { SnackBar } from "$lib/components/snackbar.store";
    import { getCookie } from "$lib/cookies";
    import { pubSocket, onPubSock } from "$lib/socket/socket";
    import type { ICard, IGame } from "$lib/types";
    import { onMount } from "svelte";
    import Card from "./card.svelte";

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
  <h1>{board.p1_username} vs {board.p2_username}</h1>
  <div class="main-board"> 
    {#each board.cards as card}
      <Card card={card} move={move} salt={board.p1_id+board.p2_id}/>
    {/each}
  </div>

{:else if errormsg!=null}
  <h1 class="err-title">Error 404</h1>
  <p class="err-msg">{errormsg}</p>
{:else}
  <p class="loading-msg">Loading...</p>
{/if}

<style>
  .main-board {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }

  
</style>