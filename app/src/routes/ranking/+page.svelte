<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import LeaderboardItem from "./leaderboardItem.svelte";
  import LoadIcon from "$lib/components/LoadIcon.svelte";

  import { onPubSock } from "$lib/adapter/socket/pubsock";
  import type { Socket } from "socket.io-client";

  let cleanPubSock: any;

  onMount(() => {
    cleanPubSock = onPubSock((pubSocket: Socket) => {
      pubSocket.emit("subscribeLeaderboard");

      pubSocket.on("leaderboardUpdate", (leaderboard) => {
        Leaderboard = leaderboard;
      });

      pubSocket.on("leaderboardUpdateError", (error) => {
        errormsg = error;
      })
    });
  });

  onDestroy(() => {
    if (cleanPubSock) {
      cleanPubSock();
    }
  });

  let errormsg: any = null;
  let Leaderboard: any;
</script>

<svelte:head>
	<title>Ranking</title>
	<meta name="description" 
  content="See how you stack up against the competition. Check out the XMemo rankings and fight your way to the top." />
</svelte:head>

{#if Leaderboard}
  <h1 class="title">Ranking Leaderboard</h1>
  {#each Leaderboard as item, index}
    <LeaderboardItem placement="{index+1}." username="{item.username}" title="{item.title}" ranking="{item.ranking}"/>
  {/each}
{:else if errormsg!=null}
  <h1 class="err-title">Error 404</h1>
  <p class="err-msg">{errormsg}</p>
{:else}
  <LoadIcon />
{/if}