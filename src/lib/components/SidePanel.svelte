<script lang="ts">
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import { DateTime } from 'luxon';
	import PowerStatisticsCard from './cards/PowerStatisticsCard.svelte';
	import WeatherCurrentCard from './cards/WeatherCurrentCard.svelte';
	import WeatherForecastsCard from './cards/WeatherForecastsCard.svelte';
	import { mdiCogOutline, mdiGamepadOutline, mdiHistory, mdiInformationOutline } from '@mdi/js';
	import ControlsPanel from './tabs/ControlsTab.svelte';
	import InfoPanel from './tabs/InfoTab.svelte';
	import LogbookPanel from './tabs/LogbookTab.svelte';
	import SettingsPanel from './tabs/SettingsTab.svelte';
	import { entities, selectedMesh, tempMeshes } from '../../stores/global';

	// todo: lights menu
	// todo: fetch user data
	// todo: keep clock up to date
	// todo: let user assign mutliple entities to mesh
	// todo: add google maps like swipe up thingy for mobile

	enum Tab {
		Controls,
		Info,
		Logbook,
		Settings
	}

	let selected = $derived($selectedMesh ? $tempMeshes[$selectedMesh] : undefined);

	let selectedEntities = $derived(selected?.entity_ids.map((i) => $entities[i]));

	let username = '@justdimaa';

	let currentTab = $state(Tab.Controls);

	let tabData = [
		{
			tab: Tab.Controls,
			icon: mdiGamepadOutline
		},

		{
			tab: Tab.Info,
			icon: mdiInformationOutline
		},

		{
			tab: Tab.Logbook,
			icon: mdiHistory
		},

		{
			tab: Tab.Settings,
			icon: mdiCogOutline
		}
	];
</script>

{#if $selectedMesh}
	{#if selectedEntities}
		<!-- <div class="flex items-center gap-2">
		<SvgIcon type="mdi" path={selectedEntities[0].attributes.icon ?? mdiDevices}></SvgIcon>
		<span class="text-3xl"
			>{selectedEntities[0].attributes.friendly_name ?? selectedEntities[0].entity_id}</span
		>
	</div> -->
		<div class="flex w-full gap-4">
			{#each tabData as tab}
				<button
					class="flex grow justify-center rounded-xl border border-white/10 bg-white/10 p-4 hover:bg-white/20 {currentTab ==
					tab.tab
						? 'bg-white/20'
						: ''}"
					onclick={() => {
						currentTab = tab.tab;
					}}
				>
					<SvgIcon type="mdi" path={tab.icon} size="24"></SvgIcon>
				</button>
			{/each}
		</div>
		{#if currentTab == Tab.Controls}
			<ControlsPanel {selectedEntities} />
		{:else if currentTab == Tab.Info}
			<InfoPanel {selectedEntities} />
		{:else if currentTab == Tab.Logbook}
			<LogbookPanel {selectedEntities} />
		{:else if currentTab == Tab.Settings}
			<SettingsPanel />
		{/if}
	{:else}
		<span>todo: add card</span>
	{/if}
{:else}
	<div class="flex justify-between">
		<div class="flex flex-col justify-between">
			<span class="font-bold">Hi, {username}!</span>
			<span class="text-neutral-400">{DateTime.now().toLocaleString(DateTime.DATETIME_MED)}</span>
		</div>
		<img
			class="aspect-square h-12 rounded-full object-cover"
			src="https://placehold.co/512x256"
			alt="pfp"
		/>
	</div>
	<WeatherCurrentCard />
	<span class="text-2xl">Forecast</span>
	<WeatherForecastsCard />
	<span class="text-2xl">Power Statistics</span>
	<PowerStatisticsCard />
{/if}
