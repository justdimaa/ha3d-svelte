<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { SceneManager } from '$lib/babylon/SceneManager';

	let canvas: HTMLCanvasElement;
	let sceneManager: SceneManager;

	onMount(() => {
		sceneManager = new SceneManager(canvas);
		sceneManager.loadModel('85be3c9d-846d-4e2e-a37e-057aa7f6007b');
	});

	onDestroy(() => {
		sceneManager?.destroy();
	});
</script>

<canvas class="h-full w-full" bind:this={canvas}></canvas>
