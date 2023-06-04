<script lang="ts">
  import AnimatedIcon from "./AnimatedIcon.svelte";
</script>

<div class="loading-icon">
  <AnimatedIcon height="75" width="75" color="rgb(255,255,255,0.6)" animationoption="5s ease infinite"/>
</div>

<style>
  .loading-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>