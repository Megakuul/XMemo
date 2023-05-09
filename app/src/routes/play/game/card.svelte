<script lang="ts">
  import type { ICard } from "$lib/types";

  export let card: ICard;
  export let move: any;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="card {card.discovered ? 'flip' : 'unflip'}"
  on:click={() => move(card._id)}
>
  {card.tag}
</div>

<style>
  .card {
    width: 100px;
    height: 100px;
    cursor: pointer;
    margin: 10px;

    box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
  }

  .flip {
    animation: flip 1s;
  }

  .unflip {
    animation: unflip 1s;
  }

  @keyframes flip {
    0% {
      transform: rotateY(360deg);
    }
    100% {
      transform: rotateY(0deg);
    }
  }

  @keyframes unflip {
    0% {
      transform: rotateY(0deg);
    }
    100% {
      transform: rotateY(360deg);
    }
  }
</style>