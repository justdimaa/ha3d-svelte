<script lang="ts">
	import { onMount } from 'svelte';
	import { SceneManager } from '$lib/babylon/SceneManager';

	let canvas: HTMLCanvasElement;
	let sceneManager: SceneManager;

	onMount(() => {
		sceneManager = new SceneManager(canvas);
	});
</script>

<canvas class="h-full w-full" bind:this={canvas}></canvas>
