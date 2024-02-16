<script lang="ts">
  import Intersecting from "$lib/components/Intersecting.svelte";
  import { getRankingColor } from "$lib/components/rankingcolor";

  export let placement: any;
  export let username: any;
  export let title: any
  export let ranking: any;

  const Gold: boolean = placement==1;
  const Silver: boolean = placement==2;
  const Bronce: boolean = placement==3;
</script>

<Intersecting styleOnDefault="scale: 0.8; opacity: 0.7;" styleOnIntersect="scale: 1; opacity: 1;" transition="all ease 1s">
  <div class="item-container" class:Gold class:Silver class:Bronce>
    <div class="placement-bx">
      {placement}
    </div>
    <div class="player-bx">
      <div class="user-name">{username}</div>
      <div class="user-title">{title}</div>
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
    margin: 20px;
    padding: 12px;

    font-size: 40px;
    height: 2em;

    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    font-weight: 700;

    background-color: rgb(255, 255, 255, 0.1);
    border-radius: 8px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px 0px;
  }

  .Gold,
  .Silver,
  .Bronce {
    --inset-shadow: inset 0 0 1rem 2rem rgba(0, 0, 0, 0.1);
    height: 2.5em;
    margin: 30px;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .Gold {
    animation: goldFlame 1s ease-in-out infinite
  }

  .Silver {
    animation: silverFlame .8s ease-in-out infinite
  }

  .Bronce {
    animation: bronceFlame 1.2s ease-in-out infinite
  }

  .Gold .placement-bx {
    color: #ffcc00;
    text-decoration: underline;
  }

  .Silver .placement-bx {
    color: #c0c0c0;
    text-decoration: underline;
  }

  .Bronce .placement-bx {
    color: #a06734;
    text-decoration: underline;
  }
  

	@keyframes goldFlame {
    0%, 100% {
      box-shadow: 0 0 3.07px #ffd700,
      1.54px -1.54px 6.15px #ffd700,
      -3.07px -3.07px 7.69px #ffcc00,
      3.07px -6.15px 9.23px #ffbd00,
      -3.07px -9.23px 12.31px #ffae00,
      0 -12.31px 13.85px #ff9e00,
      1.54px -15.38px 15.38px #ff8e00,
      var(--inset-shadow);
    }
    60% {
      box-shadow: 0 0 3.07px #ffd700,
      1.54px -1.54px 6.15px #ffd700,
      -3.07px -3.07px 7.69px #ffcc00,
      3.85px -7.69px 12.31px #ffbd00,
      -3.85px -10.77px 10.77px #ffae00,
      0 -13.85px 15.38px #ff9e00,
      1.54px -15.38px 15.38px  #ff8e00,
      var(--inset-shadow);
    }
  }

  @keyframes silverFlame {
    0%, 100% {
      box-shadow: 0 0 3.07px #c0c0c0,
      1.54px -1.54px 6.15px #b3b3b3,
      -3.07px -3.07px 7.69px #a6a6a6,
      3.07px -6.15px 9.23px #999999,
      -3.07px -9.23px 12.31px #8c8c8c,
      0 -12.31px 13.85px #7f7f7f,
      1.54px -15.38px 15.38px #727272,
      var(--inset-shadow);
    }
    30% {
      box-shadow: 0 0 3.07px #c0c0c0,
      1.54px -1.54px 6.15px #b3b3b3,
      -3.07px -3.07px 7.69px #a6a6a6,
      3.85px -7.69px 12.31px #999999,
      -3.85px -10.77px 10.77px #8c8c8c,
      0 -13.85px 15.38px #7f7f7f,
      1.54px -15.38px 15.38px  #727272,
      var(--inset-shadow);
    }
  }

  @keyframes bronceFlame {
    0%, 100% {
      box-shadow: 0 0 3.07px #cd7f32,
      1.54px -1.54px 6.15px #b87333,
      -3.07px -3.07px 7.69px #a06734,
      3.07px -6.15px 9.23px #895b35,
      -3.07px -9.23px 12.31px #724f36,
      0 -12.31px 13.85px #5b4337,
      1.54px -15.38px 15.38px #443738,
      var(--inset-shadow);
    }
    40% {
      box-shadow: 0 0 3.07px #cd7f32,
      1.54px -1.54px 6.15px #b87333,
      -3.07px -3.07px 7.69px #a06734,
      3.85px -7.69px 12.31px #895b35,
      -3.85px -10.77px 10.77px #724f36,
      0 -13.85px 15.38px #5b4337,
      1.54px -15.38px 15.38px  #443738,
      var(--inset-shadow);
    }
  }

  .item-container .placement-bx {
    flex: 1;
    padding-left: 10px;
    overflow: hidden;
  }

  .item-container .player-bx {
    padding-left: 10px;
    padding-right: 10px;
    flex: 6;
    overflow: hidden;
  }

  .item-container .player-bx .user-title {
    font-size: .5em;
    color: rgb(255, 255, 255, 0.6);
  }

  .item-container .ranking-bx {
    flex: 1;
    padding-right: 10px;
    overflow: hidden;
  }

  @media screen and (max-width: 600px) {
    .item-container {
      font-size: 15px;
      margin: 20px;
    }
  }
  @media screen and (min-width: 1400px) {
    .item-container {
      margin: 20px 100px 20px 100px;
    }
  }
</style>