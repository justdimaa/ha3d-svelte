<script lang="ts">
	import { mdiBellOutline, mdiViewDashboardEdit } from '@mdi/js';
	import SvgIcon from '@jamescoyle/svelte-icon';
	import SidePanel from './SidePanel.svelte';
	import { selectedMesh } from '../../stores/global';

	let sidePanel: SidePanel;
</script>

<div class="flex w-full flex-col gap-4 lg:grid lg:grid-cols-3 lg:p-4">
	<div class="flex w-full lg:col-span-2">
		<div class="flex w-full gap-2 px-4 pt-4 lg:p-0">
			<input
				class="pointer-events-auto h-12 grow rounded-full border border-white/10 bg-cyan-900/10 px-4 shadow outline-none backdrop-blur-2xl"
				type="text"
				placeholder="Search for entities"
			/>
			<button
				class="pointer-events-auto flex h-12 w-12 items-center justify-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-900/60 shadow-[0_0_30px_0px_rgba(103,232,249,.3)] backdrop-blur-2xl hover:bg-cyan-800/60 disabled:border-neutral-600/40 disabled:bg-neutral-900/60 disabled:text-neutral-500 disabled:shadow-none md:w-fit md:px-4"
				disabled={$selectedMesh == undefined}
				onclick={() => {
					sidePanel.onAddEntityClicked();
				}}
			>
				<SvgIcon type="mdi" path={mdiViewDashboardEdit} size="24"></SvgIcon>
				<span class="hidden md:block">Edit object</span>
			</button>
			<button
				class="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 shadow lg:backdrop-blur-2xl"
			>
				<SvgIcon type="mdi" path={mdiBellOutline} size="24"></SvgIcon>
			</button>
		</div>
	</div>
	<SidePanel bind:this={sidePanel} />
</div>
