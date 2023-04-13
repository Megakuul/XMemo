<script lang="ts">
    // This Page is just for Debug purposes right now, I will create the userinterface later on

    import { io } from "socket.io-client";
    import { page } from "$app/stores";

    // Read API URL from ENV Variable injected with vite
    let sockurl = import.meta.env.VITE_API_URL;
    // Read Gameid from URL Parameter
    const gameid = $page.url.searchParams.get('gameid');
    // Initialize Socket -> TODO: use env variable for the socket address
    const socket = io(sockurl, { path: "/gamesock" });

    // Connecting to the socket and subscribe to the Game
    socket.on("connect", () => {
        connectionstate = "connected";
        socket.emit("subscribe", gameid);
    });
    // Initial load the Gameboard
    socket.on("gameLoad", (board) => {
        // TODO: Build Gameboard
        console.log(board);
    });
    // Hydrate changes into the Gameboard
    socket.on("gameUpdate", (change) => {
        // TODO: Append changes to Gameboard
        gamevalue = change;
        console.log(change);
    });
    // Fetch SubscriptionErrors
    socket.on("subscriptionError", (errorMessage) => {
        // TODO: Implement proper error handling/message
        subscriptionerror = errorMessage
    });
    // Fetch Disconnect
    socket.on("disconnect", () => {
        // TODO: Implement proper error handling/message
        connectionstate = "disconnected";
    });

    let connectionstate = "disconnected";
    let gamevalue = "No value received";
    let subscriptionerror = "No subscription Error";

</script>

<div style="display: flex; width: 100%; flex-direction: column;">
    <h1 style="color: green;">
        {connectionstate}
    </h1>
    <h1 style="color: orange;">
        {gamevalue}
    </h1>
    <h1 style="color: red;">
        {subscriptionerror}
    </h1>
</div>

