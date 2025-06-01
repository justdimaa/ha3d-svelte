<script lang="ts">
	import SidePanel from './sidepanel/SidePanel.svelte';
	import BottomControls from './BottomControls.svelte';
	import TopActionBar from './TopActionBar.svelte';
	import { selectedMesh } from '../../../stores/global';

	interface Props {
		roomName?: string;
		selectedObject?: any;
	}

	let { roomName = 'Unknown Room' }: Props = $props();

	let blurIntensity = $state(0);

	const handleDragStateChange = (dragProgress: number) => {
		// Scale blur from 0 to 20px based on drag progress
		blurIntensity = Math.min(20, dragProgress * 80); // 80 = 20 / 0.25
	};
</script>

<div
	class="pointer-events-none absolute inset-0 z-10 flex select-none flex-col gap-3 p-3 lg:flex-row"
>
	<!-- Controls -->
	<div class="flex flex-1 flex-col justify-between space-y-2">
		<TopActionBar {roomName} />
		<BottomControls />
	</div>

	{#if $selectedMesh && blurIntensity > 0}
		<div
			class="z-5 pointer-events-auto absolute inset-0 lg:hidden"
			style="backdrop-filter: blur({blurIntensity}px); background: rgba(0, 0, 0, {blurIntensity /
				100})"
		></div>
	{/if}

	<!-- Side panel -->
	{#if $selectedMesh}
		<SidePanel onDragStateChange={handleDragStateChange} />
	{/if}
</div>
