<script lang="ts">
	import { Canvas, extend } from '@threlte/core';
	import Scene from '$lib/components/space/Scene.svelte';
	import { OrbitControls } from 'three/examples/jsm/Addons.js';
	import Overlay from '$lib/components/Overlay.svelte';

	extend({
		OrbitControls
	});
</script>

<div class="flex h-full w-full overflow-hidden">
	<div class="relative h-full w-full">
		<Canvas autoRender={false}>
			<Scene />
		</Canvas>
		<div class="pointer-events-none absolute left-0 top-0 flex h-full w-full">
			<Overlay />
		</div>
	</div>
</div>
