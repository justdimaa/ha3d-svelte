<script lang="ts">
	import { mdiPlus, mdiBellOutline } from '@mdi/js';
	import SvgIcon from '@jamescoyle/svelte-icon';
	import SidePanel from './SidePanel.svelte';
	import { selectedMesh } from '../../stores/global';

	let sidePanel: SidePanel;
</script>

<div class="flex w-full flex-col gap-4 p-4 lg:grid lg:grid-cols-3">
	<div class="flex w-full gap-4 lg:col-span-2">
		<div class="flex w-full gap-4">
			<input
				class="pointer-events-auto h-12 grow rounded-full border border-white/10 bg-cyan-900/10 px-4 outline-none backdrop-blur"
				type="text"
				placeholder="Search for entities"
			/>
			<button
				class="pointer-events-auto flex h-12 items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-900/60 px-4 shadow-[0_0_30px_0px_rgba(103,232,249,.3)] backdrop-blur hover:bg-cyan-800/60 disabled:border-neutral-600/40 disabled:bg-neutral-900/60 disabled:text-neutral-500 disabled:shadow-none"
				disabled={$selectedMesh == undefined}
				onclick={() => {
					sidePanel.onAddEntityClicked();
				}}
			>
				<SvgIcon type="mdi" path={mdiPlus} size="24"></SvgIcon>
				Add Entity
			</button>
			<button
				class="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 backdrop-blur"
			>
				<SvgIcon type="mdi" path={mdiBellOutline} size="24"></SvgIcon>
			</button>
		</div>
	</div>
	<div
		class="pointer-events-auto flex h-full w-full flex-col gap-4 overflow-y-auto overflow-x-hidden rounded-xl border border-white/10 bg-cyan-900/30 p-4 backdrop-blur lg:col-span-1"
	>
		<SidePanel bind:this={sidePanel} />
	</div>
</div>
