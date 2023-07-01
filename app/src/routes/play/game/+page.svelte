<script lang="ts">
    import { page } from "$app/stores";
    import { Move } from "$lib/adapter/play";
    import { SnackBar } from "$lib/components/snackbar.store";
    import { getCookie } from "$lib/cookies";
    import { onPubSock } from "$lib/socket/socket";
    import type { ICard, IGame } from "$lib/types";
    import { onDestroy, onMount } from "svelte";
    import Card from "./card.svelte";
    import { fade } from "svelte/transition";
    import type { Socket } from "socket.io-client";
    import LoadIcon from "$lib/components/LoadIcon.svelte";

  // Read Gameid from URL Parameter
  const gameid = $page.url.searchParams.get('gameid');

  let jwt: string | null;

  let cleanPubSock: any;

  let errormsg: any = null;

  let board: IGame;
  let cards_buf: ICard[] = [];

  onMount(() => {
    jwt = getCookie("auth");

    cleanPubSock = onPubSock((socket: Socket) => {
      socket.emit("subscribeGame", gameid);

      socket.on("gameUpdate", (game) => {
        board = game;
      });
      socket.on("gameUpdateError", (error, exacterror) => {
        errormsg = error;
      });
    });
  });

  onDestroy(() => {
    if (cleanPubSock) {
      cleanPubSock();
    }
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

  function getRankUpdateColor(rankingUpdate: number) {
    if (rankingUpdate > 80) {
      return "rgb(240,230,140)";
    } else if (rankingUpdate > 0) {
      return "rgb(0,128,0,1)";
    } else if (rankingUpdate < 0) {
      return "rgb(255,0,0,1)";
    } else {
      // Fallback
      return "white";
    }
  }
</script>

<svelte:head>
	<title>Gameboard</title>
	<meta name="description" 
  content="Watch the game {gameid}" />
</svelte:head>

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
    <h1 class="title-name { board.player1.id == board.active_id ? "active" : "" }">{board.player1.username}</h1>
    <h1>vs</h1>
    <h1 class="title-name { board.player2.id == board.active_id ? "active" : "" }">{board.player2.username}</h1>
  </div>

  <div class="main-infotable">
    <div class="infobar">
      <p class="infobar-item">Moves: {board.moves}</p>
      <p class="infobar-item">Cards: {board.cards.filter(card => card.captured === false).length}</p>
      <p class="infobar-item">Stage: {board.game_stage}</p>
    </div>
  </div>

  <div class="main-table">
    <div class="main-board"> 
      {#each board.cards as card}
        <Card card={card} move={move} salt={gameid || ""}/>
      {/each}
    </div>
    <div class="player-table">
      <div class="player-bx">
        <p>{board.player1.username}</p>
        <hr>
        <p>Cards: {board.cards.filter(card => card.owner_id === board.player1.id).length}</p>
        <p>Title: {board.player1.title}</p>
        <p>Ranking: {board.player1.ranking}
        {#if board.player1.rankupdate}
          <span style="color: {getRankUpdateColor(board.player1.rankupdate)};">{board.player1.rankupdate}</span>
        {/if}
        </p>
      </div>
      <div class="player-bx">
        <p>{board.player2.username}</p>
        <hr>
        <p>Cards: {board.cards.filter(card => card.owner_id === board.player2.id).length}</p>
        <p>Title: {board.player2.title}</p>
        <p>Ranking: {board.player2.ranking}
        {#if board.player2.rankupdate}
          <span style="color: {getRankUpdateColor(board.player2.rankupdate)};">{board.player2.rankupdate}</span>
        {/if}
        </p>
      </div>
    </div>
  </div>

{:else if errormsg!=null}
  <h1 class="err-title">Error 404</h1>
  <p class="err-msg">{errormsg}</p>
{:else}
  <LoadIcon />
{/if}

<style>
  .main-banner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 250px;
    opacity: 0.8;
    box-shadow: rgba(17, 17, 26, 0.1) 0px 4px 16px, rgba(17, 17, 26, 0.05) 0px 8px 32px;
    
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
    justify-content: space-around;
    align-items: center;

    letter-spacing: 2px;

    background: linear-gradient(45deg, blue, red);
    background-size: 200% 200%;
    background-clip: text;
    color: transparent;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    animation: gradient-animation 3s linear infinite;
  }
  
  .main-title .title-name {
    width: 600px;
    overflow: hidden;
    margin: 10px;
    padding: 10px;

    background-color: rgb(0, 0, 0, 0.1);
    border-radius: 8px;
    transition: all ease 1s;
  }

  .main-title .active {
    background-color: rgb(255, 255, 255, 0.05);
  }

  @keyframes gradient-animation {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @media screen and (max-width: 500px) {
    .main-title {
      flex-direction: column;
      justify-content: center;
    }
    .main-title .title-name {
      width: 90%;
    }
  }

  .main-infotable {
    display: flex;
    justify-content: center;
    margin: 20px 0 40px 0;
  }

  .main-infotable .infobar {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    flex-wrap: wrap;
    width: 90%;
    border-radius: 8px;
    background-color: rgb(255, 255, 255, 0.05);
  }

  .main-infotable .infobar .infobar-item {
    opacity: 0.8;
    padding: 0 20px 0 20px;
  }

  .main-table {
    display: flex;
    flex-direction: column;

    justify-content: space-between;
    align-items: center;
  }

  .main-table .main-board {
    width: 90%;
    padding: 10px 0 10px 0;
    background-color: rgb(255, 255, 255, 0.05);
    border-radius: 12px;
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
    justify-content: space-between;
  }

  .main-table .player-table .player-bx {
    padding: 10px 20px 20px 20px;
    background-color: rgb(0, 0, 0, 0.5);
    border-radius: 12px;
    width: 45%;
    overflow: hidden;

    font-size: larger;
  }

  .main-table .player-table .player-bx span {
    display: inline-block;
    scale: 0.9;
    transform: translateY(-7px);
  }

  .main-table .player-table .player-bx p {
    letter-spacing: 3px;
    font-weight: 900;
    text-align: start;
  }

  @media screen and (max-width: 750px) {
    .main-table .player-table {
      flex-direction: column;
      justify-content: center;
      margin-top: 1.5rem;
    }

    .main-table .player-table .player-bx {
      width: 90%;
      margin: 0 0 20px 0;
    }
  }

</style>