
<script lang="ts">
    export let content: string;
    export let author: string;
</script>

<div class="base-block">
    <blockquote>
        <p>{content}</p>
        
        <footer>{author}</footer>
    </blockquote>
</div>

<style>
    .base-block {
        display: flex;
        align-items: center;
        justify-content: space-around;
    }

    blockquote {
        position: relative; 
        width: 60%;
    }

    blockquote p {
        font-family: 'Raleway', sans-serif;
        background: linear-gradient(45deg, white, black);
        background-size: 200% 200%;
        background-clip: text;
        color: transparent;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;

        animation: gradient-animation 3s linear infinite;
    }


    @keyframes gradient-animation {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }

    /* This is the Blockquote in front of the textblock */
    blockquote p:first-of-type:before {
        color: white;
        -webkit-text-fill-color: white;

        font-family: 'EB Garamond', serif;
        font-size: 4em;
        opacity: 0.4;
        content: '\201c';

        position: absolute;
        top: 0;
        left: -.5em;
    }

    blockquote footer {
        position: relative;
        font-family: 'Raleway', sans-serif;
    }

    blockquote footer:before {
        content: '-';
        position: absolute;
        left: -.6em;
    }

</style>