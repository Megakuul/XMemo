<script lang="ts">
    import { page } from "$app/stores";
    import { socket, onConnected } from "$lib/socket/socket";

    // Read Gameid from URL Parameter
    const gameid = $page.url.searchParams.get('gameid');

    onConnected(() => {
        socket.emit("subscribeGame", gameid);

        socket.on("gameUpdate", (game) => {
            board = game;
        });
        socket.on("gameUpdateError", (error, exacterror) => {
            errormsg = error;
        })
    });


    let errormsg: any = null;
    let board: any;
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