<script lang="ts">
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import PowerStatisticsCard from './cards/PowerStatisticsCard.svelte';
	import WeatherCurrentCard from './cards/WeatherCurrentCard.svelte';
	import WeatherForecastsCard from './cards/WeatherForecastsCard.svelte';
	import { mdiCogOutline, mdiGamepadOutline, mdiHistory, mdiInformationOutline } from '@mdi/js';
	import ControlsPanel from './tabs/ControlsTab.svelte';
	import InfoPanel from './tabs/InfoTab.svelte';
	import LogbookPanel from './tabs/LogbookTab.svelte';
	import SettingsPanel from './tabs/SettingsTab.svelte';
	import { entities, selectedMesh, tempMeshes, user } from '../../stores/global';
	import UserCard from './cards/UserCard.svelte';

	enum Tab {
		Controls,
		Info,
		Logbook,
		Settings
	}

	let userEntity = $derived($user ? $entities[`person.${$user.name}`] : undefined);

	let selected = $derived($selectedMesh ? $tempMeshes[$selectedMesh] : undefined);

	let selectedEntities = $derived(selected?.entity_ids.map((i) => $entities[i]));

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
	{#if userEntity}
		<UserCard {userEntity} />
	{/if}
	<WeatherCurrentCard />
	<span class="text-2xl">Forecast</span>
	<WeatherForecastsCard />
	<span class="text-2xl">Power Statistics</span>
	<PowerStatisticsCard />
{/if}
