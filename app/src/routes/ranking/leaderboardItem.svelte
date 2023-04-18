<script lang="ts">
  import Intersecting from "$lib/components/Intersecting.svelte";

  export let placement: any;
  export let username: any;
  export let ranking: any;
</script>

<Intersecting styleOnDefault="scale: 0.8; opacity: 0.7;" styleOnIntersect="scale: 1; opacity: 1;" transition="all ease 1s">
  <div class="item-container">
    <div class="placement-bx">
      {placement}
    </div>
    <div class="username-bx">
      {username}
    </div>
    <div class="ranking-bx">
      {ranking}
    </div>
  </div>
</Intersecting>

<style>
  .item-container {
    display: flex;
    align-items: center;
    flex-direction: row;
    margin: 20px;

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
    }
  }
</style>