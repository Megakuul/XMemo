<script lang="ts">
  import { onConnected, socket } from "$lib/socket/socket";
    import LeaderboardItem from "./leaderboardItem.svelte";

  onConnected(() => {
    socket.emit("subscribeLeaderboard");

    socket.on("leaderboardUpdate", (leaderboard) => {
        Leaderboard = leaderboard;
    });

    socket.on("leaderboardUpdateError", (error) => {
        errormsg = error;
    })
  });


  let errormsg: any = null;
  let Leaderboard: any;
</script>

<h1 class="title">Ranking Leaderboard</h1>

{#if Leaderboard}
  {#each Leaderboard as item, index}
    <LeaderboardItem placement="{index+1}." username="{item.username}" ranking="{item.ranking}"/>
  {/each}
{:else if errormsg!=null}
  <h1 class="err-title">Error 404</h1>
  <p class="err-msg">{errormsg}</p>
{:else}
  <p class="loading-msg">Loading...</p>
{/if}