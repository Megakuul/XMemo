<script lang="ts">
    import { onConnected, socket } from "$lib/socket/socket";

    onConnected(() => {
        socket.emit("subscribeLeaderboard");

        socket.on("leaderboardUpdate", (leaderboard) => {
            console.log(leaderboard);
        });
        socket.on("leaderboardUpdateError", (error) => {
            console.log("Salat");
            errormsg = error;
        })
    });


    let errormsg: any = null;
    let leaderboard: any;
</script>

<h1 class="title">Ranking Leaderboard</h1>

{#if leaderboard}
    <div class="main-container">
        <div>
            Hallo
        </div>
        <div>
            Salut
        </div>
        <div>
            Meister
        </div>
    </div>
{:else if errormsg!=null}
    <h1 class="err-title">Error 404</h1>
    <p class="err-msg">{errormsg}</p>
{:else}
    <p class="loading-msg">Loading...</p>
{/if}


<style>
    .title {
        text-align: center;
        width: 100%;
        font-size: 70px;
    }

    .main-container {
        width: 100%;
        font-size: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    @media screen and (max-width: 1000px) {
        .title {
            font-size: 40px;
        }
    }
</style>