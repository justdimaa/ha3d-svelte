<script lang="ts">
	import { mdiBellOutline, mdiCircleOffOutline, mdiCircleOutline } from '@mdi/js';
	import SvgIcon from '@jamescoyle/svelte-icon';
	import SidePanel from './SidePanel.svelte';
	import { sceneManager, showDotIndicators } from '../../stores/global';
	import { onMount } from 'svelte';

	let sidePanel: SidePanel;

	function toggleDotIndicators() {
		showDotIndicators.update((visible) => {
			const newVisibility = !visible;

			if ($sceneManager?.dotIndicatorManager) {
				$sceneManager.dotIndicatorManager.setVisibility(newVisibility);
			}
			return newVisibility;
		});
	}

	onMount(() => {
		showDotIndicators.init();
	});
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
				onclick={toggleDotIndicators}
				title={$showDotIndicators ? 'Hide dot indicators' : 'Show dot indicators'}
			>
				<SvgIcon
					type="mdi"
					path={$showDotIndicators ? mdiCircleOutline : mdiCircleOffOutline}
					size="24"
				></SvgIcon>
			</button>
			<button
				class="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-cyan-700/20 shadow lg:backdrop-blur-2xl"
			>
				<SvgIcon type="mdi" path={mdiBellOutline} size="24"></SvgIcon>
			</button>
		</div>
	</div>
	<SidePanel bind:this={sidePanel} />
</div>
