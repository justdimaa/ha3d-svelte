<script lang="ts">
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import PowerStatisticsCard from './cards/PowerStatisticsCard.svelte';
	import WeatherCurrentCard from './cards/WeatherCurrentCard.svelte';
	import WeatherForecastsCard from './cards/WeatherForecastsCard.svelte';
	import {
		mdiChevronDown,
		mdiChevronUp,
		mdiCogOutline,
		mdiDevices,
		mdiGamepadOutline,
		mdiHistory,
		mdiInformationOutline
	} from '@mdi/js';
	import ControlsPanel from './tabs/ControlsTab.svelte';
	import InfoPanel from './tabs/InfoTab.svelte';
	import LogbookPanel from './tabs/LogbookTab.svelte';
	import SettingsPanel from './tabs/SettingsTab.svelte';
	import { entities, selectedMesh, tempMeshes, user } from '../../stores/global';
	import UserCard from './cards/UserCard.svelte';
	import AddTab from './tabs/AddTab.svelte';
	import { spring } from 'svelte/motion';

	enum Tab {
		Controls,
		Info,
		Logbook,
		Settings,
		AddEntity
	}

	interface TabData {
		type: Tab;
		icon: string;
		hidden: boolean;
	}

	let isPanelHidden = $state(true);

	let userEntity = $derived($user ? $entities[`person.${$user.name}`] : undefined);
	let weatherEntity = $derived($entities['weather.openweathermap']);

	let selected = $derived($selectedMesh ? $tempMeshes[$selectedMesh] : undefined);

	let selectedEntities = $derived(selected?.entityIds.map((i) => $entities[i]));

	let currentTab = $state(Tab.Controls);

	$effect(() => {
		if (selected) return;
		currentTab = Tab.Controls;
	});

	let tabData: TabData[] = [
		{
			type: Tab.Controls,
			icon: mdiGamepadOutline,
			hidden: false
		},
		{
			type: Tab.Info,
			icon: mdiInformationOutline,
			hidden: false
		},
		{
			type: Tab.Logbook,
			icon: mdiHistory,
			hidden: false
		},
		{
			type: Tab.Settings,
			icon: mdiCogOutline,
			hidden: false
		},
		{
			type: Tab.AddEntity,
			icon: mdiDevices,
			hidden: true
		}
	];

	export function onAddEntityClicked() {
		currentTab = Tab.AddEntity;
	}

	let snapPointsPercent = [30, 100]; // Points where menu can snap to
	let firstPercent = snapPointsPercent[0];
	let lastPercent = snapPointsPercent[snapPointsPercent.length - 1];
	let containerHeight: number;

	// Simple spring with moderate settings
	const height = spring(snapPointsPercent[0], {
		stiffness: 0.2,
		damping: 0.8
	});

	function setupResizeObserver(node: HTMLElement) {
		if (typeof ResizeObserver === 'undefined') return;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				containerHeight = entry.contentRect.height;
			}
		});

		resizeObserver.observe(node);
		return {
			destroy() {
				resizeObserver.disconnect();
			}
		};
	}
</script>

{#if $user}
	<div
		use:setupResizeObserver
		class="pointer-events-auto absolute bottom-0 left-0 right-0 overflow-y-auto overflow-x-hidden rounded-t-xl border border-white/10 bg-cyan-700/30 backdrop-blur-2xl lg:relative lg:col-span-2 lg:flex lg:!h-full lg:flex-col lg:rounded-xl lg:!rounded-t-xl lg:!border lg:backdrop-blur xl:col-span-1"
		class:border-0={!isPanelHidden}
		class:!rounded-none={!isPanelHidden}
		style="height: {$height}%;"
	>
		<button
			class="flex w-full justify-center lg:hidden"
			onclick={() => {
				if ($height < firstPercent + 10) {
					height.set(lastPercent);
					isPanelHidden = false;
				} else {
					height.set(firstPercent);
					isPanelHidden = true;
				}
			}}
		>
			<SvgIcon
				type="mdi"
				path={$height < firstPercent + 10 ? mdiChevronUp : mdiChevronDown}
				size="28"
				class="opacity-40"
			/>
		</button>

		{#if $selectedMesh}
			<div
				class="flex w-full gap-2 rounded-xl bg-white/10 p-2 shadow lg:!flex"
				class:hidden={isPanelHidden}
			>
				{#each tabData.filter((d) => !d.hidden) as tab}
					<button
						class="flex h-12 grow items-center justify-center rounded-xl hover:bg-white/10 disabled:bg-transparent disabled:text-white/20 lg:backdrop-blur-2xl {currentTab ===
						tab.type
							? 'bg-white/10'
							: ''}"
						disabled={selectedEntities == undefined}
						onclick={() => {
							currentTab = tab.type;
						}}
					>
						<SvgIcon type="mdi" path={tab.icon} size="24"></SvgIcon>
					</button>
				{/each}
			</div>
			<div class="flex w-full flex-col gap-2 overflow-y-auto rounded-xl p-4">
				{#if currentTab === Tab.Controls && selectedEntities}
					<ControlsPanel {selectedEntities} addEvent={onAddEntityClicked} />
				{:else if currentTab === Tab.Info && selectedEntities}
					<InfoPanel {selectedEntities} />
				{:else if currentTab === Tab.Logbook && selectedEntities}
					<LogbookPanel {selectedEntities} />
				{:else if currentTab === Tab.Settings}
					<SettingsPanel />
				{:else}
					<AddTab {selectedEntities} />
				{/if}
			</div>
		{:else}
			<div class="flex flex-col gap-4 p-4">
				{#if userEntity}
					<UserCard {userEntity} />
				{/if}
				{#if weatherEntity}
					<WeatherCurrentCard {weatherEntity} />
					<div class="flex flex-col gap-2">
						<span class="text-2xl">Forecast</span>
						<WeatherForecastsCard {weatherEntity} />
					</div>
				{/if}
				<div class="flex flex-col gap-2">
					<span class="text-2xl">Power Statistics</span>
					<PowerStatisticsCard />
				</div>
			</div>
		{/if}
	</div>
{/if}
