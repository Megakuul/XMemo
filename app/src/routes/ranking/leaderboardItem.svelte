<script lang="ts">
  import Intersecting from "$lib/components/Intersecting.svelte";

  export let placement: any;
  export let username: any;
  export let ranking: any;

  function getPlacementColor(placement: number): any {
    switch (Number(placement)) {
      case 1:
        return "rgb(240,230,140)";
      case 2:
        return "rgb(192,192,192)";
      case 3:
        return "rgb(205,127,50)";
      default:
        return "white"
    }
  }

  function getRankingColor(ranking: number): any {
    if (ranking > 2000) {
      return "rgb(240,230,140)";
    } else if (ranking > 500) {
      return "rgb(0,128,0,1)";
    } else if (ranking > 0) {
      return "rgb(255,255,255,0.7)";
    } else {
      return "rgb(255,0,0,0.5)";
    }
  }
</script>

<Intersecting styleOnDefault="scale: 0.8; opacity: 0.7;" styleOnIntersect="scale: 1; opacity: 1;" transition="all ease 1s">
  <div class="item-container">
    <div class="placement-bx" 
      style="color: {getPlacementColor(placement)};">
      {placement}
    </div>
    <div class="username-bx">
      {username}
    </div>
    <div class="ranking-bx" 
      style="color: {getRankingColor(ranking)}">
      {ranking}
    </div>
  </div>
</Intersecting>

<style>
  .item-container {
    display: flex;
    align-items: center;
    flex-direction: row;
    margin: 30px;

    font-size: 40px;
    height: 1.5em;

    text-align: center;
    overflow: hidden;
    white-space: nowrap;

    background-color: rgb(255, 255, 255, 0.2);
    border-radius: 20px;
    border: solid white 1px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px 0px;
  }

  .item-container .placement-bx {
    flex: 1;
    padding-left: 10px;
    overflow: hidden;
  }

  .item-container .username-bx {
    padding-left: 10px;
    padding-right: 10px;
    flex: 6;
    overflow: hidden;
  }

  .item-container .ranking-bx {
    flex: 1;
    padding-right: 10px;
    overflow: hidden;
  }

  @media screen and (max-width: 600px) {
    .item-container {
      font-size: 20px;
      margin: 20px;
    }
  }
  @media screen and (min-width: 1400px) {
    .item-container {
      margin: 20px 100px 20px 100px;
    }
  }
</style>