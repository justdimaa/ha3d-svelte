<script lang="ts">
	import { mdiBellOutline, mdiViewDashboardEdit } from '@mdi/js';
	import SvgIcon from '@jamescoyle/svelte-icon';
	import SidePanel from './SidePanel.svelte';
	import { selectedMesh } from '../../stores/global';

	let sidePanel: SidePanel;
</script>

<div class="flex w-full flex-col gap-4 lg:grid lg:grid-cols-5 lg:p-4 xl:grid-cols-3">
	<div class="flex w-full lg:col-span-3 xl:col-span-2">
		<div class="flex w-full gap-2 px-4 pt-4 lg:p-0">
			<input
				class="pointer-events-auto h-12 grow rounded-full border border-white/10 bg-cyan-700/20 px-4 shadow outline-none backdrop-blur-2xl"
				type="text"
				placeholder="Search for entities"
			/>
			<button
				class="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-cyan-700/20 shadow lg:backdrop-blur-2xl"
			>
				<SvgIcon type="mdi" path={mdiBellOutline} size="24"></SvgIcon>
			</button>
		</div>
	</div>
	<SidePanel bind:this={sidePanel} />
</div>
