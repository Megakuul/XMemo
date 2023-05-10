<script>
// @ts-nocheck
  import Identicon from "identicon.js";
  import crypto from "crypto-js";
  import { onMount } from "svelte";

  export let size;
  export let salt;
  export let tag;
  let seed = tag + salt;

  let src;

  onMount(() => {
    const hash = crypto.MD5(seed).toString();
    const identicon = new Identicon(hash, {
      size,
      format: "svg",
      background: [44, 47, 51, 255]
    });

    src = `data:image/svg+xml;base64,${identicon.toString()}`;
  });
</script>

<img {src} alt="Random identicon" width="{size}" height="{size}" />

<style>
  img {
    display: inline-block;
  }
</style>
