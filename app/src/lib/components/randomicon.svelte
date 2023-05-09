<script lang="ts">
  import Identicon from "identicon.js";
  import crypto from "crypto-js";
  import { onMount } from "svelte";

  export let size = 64;
  export let seed = Math.random().toString(36).substr(2, 9);

  let canvas: HTMLDivElement;

  onMount(() => {
    const hash = crypto.MD5(seed).toString();
    const identicon = new Identicon(hash, {
      size,
      format: "svg",
    });

    canvas.innerHTML = identicon.toString();
  });
</script>

<div bind:this="{canvas}"></div>

<style>
  div {
    display: inline-block;
  }
</style>
