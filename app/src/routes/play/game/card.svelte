<script lang="ts">
  import { writable, derived } from 'svelte/store';
  import RandomIcon from "$lib/components/randomicon.svelte";
  import type { ICard } from "$lib/types";
  import AnimatedIcon from '$lib/components/animatedicon.svelte';

  export let card: ICard;
  export let move: any;
  export let salt: string;

  // Previous Card Store
  const prevCard = writable<ICard | null>(null);
  // Current Card Store
  const currentCard = writable<ICard>(card);

  /**
   * This function is checking if the current card has the same discovered State as the previous card
   * 
   * The function will always be executed if the Sveltestore State changes
   */
  const discoveredStateChanged = derived(
    [prevCard, currentCard],
    ([$prevCard, $currentCard]) => $prevCard && $prevCard.discovered !== $currentCard.discovered
  );

  // This will set the previous card and the current card if the State of the cards get changed
  $: if (card) {
    prevCard.set($currentCard);
    currentCard.set(card);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="card {card.discovered ? 'flip' : 'unflip'} { $discoveredStateChanged ? 'animate' : '' }"
  on:click={() => move(card._id)}
>
  {#if card.captured}
    <div class="cardcaptured">
    </div>
  {:else if card.discovered}
    <RandomIcon tag={card.tag} salt={salt}></RandomIcon>
  {:else}
    <div class="cardbackside">
      <AnimatedIcon height="75" width="75" color="rgb(255,255,255,0.6)" animationoption="8s ease"/>
    </div>
  {/if}
</div>

<style>
  .animate.flip {
    animation: flip 1s;
  }

  .animate.unflip {
    animation: unflip 1s;
  }

  .card {
    width: 100px;
    height: 100px;
    margin: 7px;
    border-radius: 8px;
    user-select: none;

    box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
  }

  .card:hover {
    box-shadow: rgba(0, 0, 0, 0.2) 3px 3px 4px;
  }

  .cardbackside {
    width: 100%;
    height: 100%;
    border-radius: 8px;

    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.5);

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .cardcaptured {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    
    background-color: rgba(0, 0, 0, 0.2);
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

  @media only screen and (min-width: 1600px) {
    .card {
      width: 150px;
      height: 150px;
      margin: 10px;
    }
  }

  @media only screen and (max-width: 700px) {
    .card {
      width: 30px;
      height: 30px;
      margin: 3px;
    }
  }
</style>