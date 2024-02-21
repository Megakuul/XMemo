<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { page } from "$app/stores";

  import { SnackBar } from "$lib/components/snackbar.store";
  import { getCookie } from "$lib/helper/cookies";
  import { onPubSock } from "$lib/adapter/socket/pubsock";
  import { GetProfile} from "$lib/adapter/rest/auth";
  import { Move, TakeMove} from "$lib/adapter/rest/play";
  import type { Socket } from "socket.io-client";
  import type { AdapterCard, AdapterGame, AdapterProfile } from "$lib/adapter/types";
    
  import Card from "./card.svelte";
  import LoadIcon from "$lib/components/LoadIcon.svelte";

  // Read Gameid from URL Parameter
  const gameid = $page.url.searchParams.get('gameid');

  const title = "Gameboard";

  let countdown: number = 0;

  let profile: AdapterProfile | null;

  let cleanPubSock: any;

  let errormsg: any = null;

  let board: AdapterGame;
  let cards_buf: AdapterCard[] = [];

  onMount(async () => {
    profile = await GetProfile()

    cleanPubSock = onPubSock((socket: Socket) => {
      socket.emit("subscribeGame", gameid);

      socket.on("gameUpdate", (game) => {
        board = game;
        if (document.hidden && board.active_id == profile?.userid) {
          document.title="Its your turn!";
        }
      });
      socket.on("gameUpdateError", (error, exacterror) => {
        errormsg = error;
      });
    });

    initCountdown(500);
  });

  onDestroy(() => {
    if (cleanPubSock) {
      cleanPubSock();
    }
  })

  /**
   * Rotates the cards that got edited
   * 
   * This is here so only the cards that got changed will animate
  */
  $: if (board && board.cards) {
    board.cards.forEach((card, index) => {
      const prevCard = cards_buf[index] || {};
      if (prevCard.discovered !== card.discovered) {
        card.rotate = true;
      } else {
        card.rotate = false;
      }
    });

    cards_buf = board.cards.map(card => ({ ...card }));
  }

  /**
   * Wraps the Move Adapter to make a move
   * @param cardid Id of the card to discover
   */
  async function move(cardid: string) {
    try {
      if (!gameid) {
        $SnackBar.message = "No valid Game";
        $SnackBar.color = "red";
        return;
      }
      await Move(gameid, cardid);
    } catch (err: any) {
      $SnackBar.message = err.message;
      $SnackBar.color = "red";
    } 
  }

  /**
   * Wraps the TakeMove Adapter to take a move
   */
  async function takemove() {
    try {
      if (!gameid) {
        $SnackBar.message = "No valid Game";
        $SnackBar.color = "red";
        return;
      }
      await TakeMove(gameid);
    } catch (err: any) {
      $SnackBar.message = err.message;
      $SnackBar.color = "red";
    }
  }

  /**
   * Initializes the countdown that updates the countdown periodically
   * 
   * This function is there that the Time for the move is updated on base of the board.nextmove time
   * 
   * sideeffects:
   * - reads the board.nextmove to fetch the time of the next move
   * - writes to the countdown variable to set the time
   * @param interval intervall of the updates
   */
  function initCountdown(interval: number) {
    setInterval(() => {
      const curDate = new Date();
      const tarDate = new Date(board.nextmove);
      countdown = Math.max(0, Math.floor((tarDate.getTime() - curDate.getTime()) / 1000));
    }, interval)
  }

  /**
   * Gets the color for the ranking update number
   * @param rankingUpdate Ranking Update number
   */
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

  /**
   * Resets the Document title if the document is not hidden
   */
  function resetDocTitle() {
    if (!document.hidden) {
      document.title=title;
    }
  }

  /**
   * Checks if the user is part of the game, but not the active player
   * -> The opposite of active_id
   */
  function isPlayerNotActive(playerid: string | undefined, board: AdapterGame): boolean {
    if (!playerid) return false;
    if (playerid != board.player1.id && playerid != board.player2.id) return false;
    if (playerid==board.active_id) return false;
    return true;
  }
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" 
  content="Watch the game {gameid}" />
</svelte:head>

<svelte:document on:visibilitychange={resetDocTitle} />


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
      {#if countdown >= 1 || !isPlayerNotActive(profile?.userid, board)}
      <p class="infobar-item">Time: {countdown}</p>
      {:else}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <p in:fade class="infobar-item btn" on:click={takemove}>Take Move</p>
      {/if}
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
    box-shadow: inset 0 0 5px rgba(0,0,0,0.5);
    user-select: none;
    -webkit-user-select: none;
  }

  .main-infotable .infobar .infobar-item {
    opacity: 0.8;
    padding: 0 20px 0 20px;
  }

  .main-infotable .infobar .infobar-item.btn {
    background-color: rgba(0, 255, 0, 0.6);
    box-shadow: rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset;
    border-radius: 8px;
    cursor: pointer;
    transition: all ease .8s;
  }

  .main-infotable .infobar .infobar-item.btn:hover {
    background-color: rgb(0, 255, 0, 0.5);
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
    box-shadow: inset 0 0 5px rgba(0,0,0,0.5);
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