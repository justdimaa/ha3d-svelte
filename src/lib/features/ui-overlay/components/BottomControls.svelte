<script lang="ts">
	import SvgIcon from '$lib/shared/components/SvgIcon.svelte';
	import { mdiPlus, mdiMinus, mdiHome } from '@mdi/js';
	import OverlayButton from './OverlayButton.svelte';
	import { sceneManager } from '$lib/shared/stores/global';

	const zoomCamera = (factor: number) => {
		$sceneManager?.cameraController.zoom(factor);
	};

	const resetCameraPosition = () => {
		$sceneManager?.cameraController.resetView();
	};
</script>

<div class="flex w-full items-end justify-between">
	<div class="flex flex-col gap-2">
		<!-- Zoom controls -->
		<div
			class="hidden flex-col overflow-hidden rounded-xl bg-white/10 shadow-sm backdrop-blur-xl dark:bg-gray-800/80 lg:flex"
		>
			<button
				class="pointer-events-auto p-3 transition-colors hover:bg-white/10 active:bg-white/20 dark:hover:bg-gray-700/50"
				onclick={() => zoomCamera(1.2)}
				aria-label="Zoom in"
			>
				<SvgIcon type="mdi" path={mdiPlus} size="20" class="text-white dark:text-gray-100" />
			</button>
			<div class="h-px bg-white/10 dark:bg-gray-700/50"></div>
			<button
				class="pointer-events-auto p-3 transition-colors hover:bg-white/10 active:bg-white/20 dark:hover:bg-gray-700/50"
				onclick={() => zoomCamera(0.8)}
				aria-label="Zoom out"
			>
				<SvgIcon type="mdi" path={mdiMinus} size="20" class="text-white dark:text-gray-100" />
			</button>
		</div>

		<!-- Reset view -->
		<OverlayButton
			icon={mdiHome}
			onclick={resetCameraPosition}
			ariaLabel="Reset view"
			class="p-3"
		/>
	</div>
</div>
