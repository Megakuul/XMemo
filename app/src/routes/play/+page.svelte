<script lang="ts">
    // This Page is just for Debug purposes right now, I will create the userinterface later on
    let text: any;


</script>

<h1>Play</h1>
<input type="text" bind:value={text} placeholder="type in Gameid">
<a href="/play/game?gameid={text}" on:click={() => console.log(text)}>Redirect to board</a>