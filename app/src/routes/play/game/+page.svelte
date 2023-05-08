<script lang="ts">
  import { page } from "$app/stores";
    import { Move } from "$lib/adapter/play";
    import { SnackBar } from "$lib/components/snackbar.store";
    import { getCookie } from "$lib/cookies";
  import { pubSocket, onPubSock } from "$lib/socket/socket";
  import type { ICard, IGame } from "$lib/types";
    import { onMount } from "svelte";

  // Read Gameid from URL Parameter
  const gameid = $page.url.searchParams.get('gameid');

  let jwt: string | null;

  let errormsg: any = null;
  let board: IGame;
  let cards_buf: ICard[] = [];
  let rotationStates: Map<number, boolean> = new Map();

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
        rotationStates.set(index, true);
        console.log("Settrr")
        setTimeout(() => {
          rotationStates.set(index, false);
        }, 600);
      }
    });

    cards_buf = deepCopy(board.cards);
  }

  function deepCopy(cards: ICard[]): ICard[] {
    return cards.map(card => ({ ...card }));
  }

  function getRotation(index: number) {
    return rotationStates.get(index) ? 'rotateY(360deg)' : '';
  }

  async function move() {
    try {
      let queueMessage = await Move();
    } catch (err: any) {
      $SnackBar.message = err.message;
      $SnackBar.color = "red";
    } 
  }
</script>



{#if board && board.cards}
  <h1>{board.p1_username} vs {board.p2_username}</h1>
  <div class="main-board"> 
    {#each board.cards as card, index}
      <div
        class="card"
        style="transform: {getRotation(index)}"
        
      >
      {card.discovered ? card.tag : ""}
      </div>
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

  .card {
    width: 100px;
    height: 100px;
    cursor: pointer;
    margin: 10px;

    background-color: var(--gray);
    box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;

    transition: all ease 1s;
  }

  .card.rotate {
    animation: spin 0.6s linear;
  }

  @keyframes spin {
    from {
      transform: rotateY(0deg);
    }
    to {
      transform: rotateY(360deg);
    }
  }
</style>