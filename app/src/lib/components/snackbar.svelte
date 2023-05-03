<!-- 
  SnackBar

  A clean Snackbar to pop up and show a message

  Edit the global SnackBar Object in the snackbar.store.ts file to make changes to the Snackbar

  Sideeffects:
  - This Component gets influenced by the SnackBar Object in the snackbar.store.ts file
-->

<script lang="ts">
  import { fade } from 'svelte/transition';
  import { SnackBar, type ISnackbar } from './snackbar.store';

  $: if (SnackBar.visible) {
    setTimeout(() => {
        SnackBar.visible = false;
    }, SnackBar.delay);
  }
</script>

{#if SnackBar.visible}
<div
  class="snackbar"
  style="background-color: {SnackBar.color};"
  in:fade="{{ duration: 300 }}"
  out:fade="{{ duration: 300 }}"
>
  {SnackBar.message}
</div>
{/if}

<style>
  .snackbar {
    position: fixed;
    width: 80%;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #323232;
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    font-size: 16px;
    text-align: center;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    z-index: 1000;
  }
</style>
  