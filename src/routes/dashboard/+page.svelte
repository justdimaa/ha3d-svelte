<script lang="ts">
	import Overlay from '$lib/features/ui-overlay/components/Overlay.svelte';
	import Canvas from '$lib/features/3d-scene/components/Canvas.svelte';
	import { onMount } from 'svelte';
	import { theme } from '$lib/shared/stores/theme';

	// Room data
	let roomName = $state('Bedroom');

	onMount(() => {
		theme.init();
	});
</script>

<div class="flex h-full w-full overflow-hidden">
	<div class="relative h-full w-full">
		<!-- 3D Room Renderer -->
		<Canvas />

		<!-- 3D Room Overlay -->
		<Overlay {roomName} />
	</div>
</div>
