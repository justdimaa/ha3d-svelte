<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { SceneManager } from '$lib/babylon/SceneManager';

	let canvas: HTMLCanvasElement;
	let sceneManager: SceneManager;

	onMount(() => {
		sceneManager = new SceneManager(canvas);
	});

	onDestroy(() => {
		sceneManager?.destroy();
	});
</script>

<canvas class="h-full w-full" bind:this={canvas}></canvas>
