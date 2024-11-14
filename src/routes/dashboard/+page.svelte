<script lang="ts">
	import Overlay from '$lib/components/Overlay.svelte';
	import Canvas from '$lib/components/Canvas.svelte';
</script>

<div class="flex h-full w-full overflow-hidden">
	<div class="relative h-full w-full">
		<Canvas />
		<div class="pointer-events-none absolute left-0 top-0 flex h-full w-full">
			<Overlay />
		</div>
	</div>
</div>
