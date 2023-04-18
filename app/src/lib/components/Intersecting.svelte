<script lang="ts">
  import { onMount } from 'svelte';
  
  export let styleOnIntersect: any;
  export let styleOnDefault: any;
  export let transition: any;
  let element: any;
  let style = styleOnDefault;
  onMount(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          style = styleOnIntersect;
        } else {
          style = styleOnDefault;
        }
      });
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  });
</script>

<div bind:this="{element}" style="transition: {transition}; {style}">
    <slot></slot>
</div>