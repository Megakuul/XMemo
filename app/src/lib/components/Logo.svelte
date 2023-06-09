<script lang="ts">
    /**
     * Height of the SVG
     */
    export let height: string;
    /**
     * Width of the SVG
     */
    export let width: string;
    /**
     * Stroke color
     */
    export let color: string;
    /**
     * Options for the animation
     * 
     * Example:
     * ```javascript
     * <AnimatedIcon width="200" height="200" color="black" animationoption="3s linear infinite"/>
     * ```
     */
    export let animationoption: string;
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 489 489" width="{width}" height="{height}" style="--animation-options: {animationoption};">

  <line class="line" stroke="{color}" x1="24" y1="24" x2="465" y2="465"/>
  <line class="line" stroke="{color}" x1="465" y1="24" x2="24" y2="465"/>
  <line class="line" stroke="{color}" x1="124.5" y1="124.5" x2="124.5" y2="464.5"/>
  <line class="line" stroke="{color}" stroke-dasharray="100" stroke-dashoffset="200" x1="364.5" y1="124.5" x2="364.5" y2="464.5"/>
</svg>

<style>
    .line {
      fill: none;
      stroke-linecap: round;
      stroke-miterlimit: 10;
      stroke-width: 48px;
      stroke-dasharray: 4000;
      stroke-dashoffset: 4000;
      animation: draw var(--animation-options) forwards;
    }

    @keyframes draw {
      100% {
        stroke-dashoffset: 0;
      }
    }
</style>