<script>
// @ts-nocheck
  import Identicon from "identicon.js";
  import crypto from "crypto-js";
  import { onMount } from "svelte";

  export let salt;
  export let tag;
  let seed = tag + salt;

  let src;

  onMount(() => {
    const hash = crypto.MD5(seed).toString();
    const identicon = new Identicon(hash, {
      format: "svg",
      background: [44, 47, 51, 255]
    });

    src = `data:image/svg+xml;base64,${identicon.toString()}`;
  });
</script>

<img {src} alt="Random identicon" />

<style>
  img {
    display: inline-block;
    border-radius: 8px;
    width: 100%;
    height: 100%;
  }
</style>
