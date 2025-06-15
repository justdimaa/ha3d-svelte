<script lang="ts">
	import SvgIcon from '$lib/shared/components/SvgIcon.svelte';
	import { mdiSprout, mdiWater, mdiThermometer, mdiWhiteBalanceSunny, mdiAlert } from '@mdi/js';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import CardBase from './CardBase.svelte';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();

	// Get status color based on plant state
	const getStatusColor = (state: string) => {
		switch (state) {
			case 'ok':
				return {
					bg: 'bg-green-100 dark:bg-green-900/50',
					text: 'text-green-600 dark:text-green-400',
					icon: 'text-green-600 dark:text-green-400'
				};
			case 'problem':
				return {
					bg: 'bg-red-100 dark:bg-red-900/50',
					text: 'text-red-600 dark:text-red-400',
					icon: 'text-red-600 dark:text-red-400'
				};
			case 'warning':
				return {
					bg: 'bg-yellow-100 dark:bg-yellow-900/50',
					text: 'text-yellow-600 dark:text-yellow-400',
					icon: 'text-yellow-600 dark:text-yellow-400'
				};
			default:
				return {
					bg: 'bg-gray-100 dark:bg-gray-700',
					text: 'text-gray-600 dark:text-gray-400',
					icon: 'text-gray-600 dark:text-gray-400'
				};
		}
	};

	// Get status icon based on condition
	const getStatusIcon = (status: string) => {
		switch (status?.toLowerCase()) {
			case 'low':
				return mdiAlert;
			case 'ok':
				return null; // No icon for ok status
			default:
				return mdiAlert;
		}
	};

	// Get problem list
	const getProblems = () => {
		const problems = [];
		if (entity.attributes.moisture_status === 'Low') problems.push('Low moisture');
		if (entity.attributes.dli_status === 'Low') problems.push('Insufficient light');
		if (entity.attributes.temperature_status === 'Low') problems.push('Low temperature');
		if (entity.attributes.temperature_status === 'High') problems.push('High temperature');
		return problems;
	};

	const statusColor = $derived(getStatusColor(entity.state));
	const problems = $derived(getProblems());

	// Derived status icons
	const moistureIcon = $derived(getStatusIcon(entity.attributes.moisture_status));
	const temperatureIcon = $derived(getStatusIcon(entity.attributes.temperature_status));
	const lightIcon = $derived(getStatusIcon(entity.attributes.dli_status));
</script>

<CardBase
	{entity}
	icon={mdiSprout}
	iconBg={statusColor.bg}
	iconColor={statusColor.icon}
	primaryValue={entity.state.charAt(0).toUpperCase() + entity.state.slice(1)}
	primaryValueColor={statusColor.text}
	secondaryText={entity.attributes.species || 'Plant'}
>
	<!-- Plant status indicators -->
	<div class="grid grid-cols-3 gap-2">
		<!-- Moisture -->
		<div class="flex items-center gap-1 rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
			<SvgIcon type="mdi" path={mdiWater} size="12" class="text-blue-500 dark:text-blue-400" />
			{#if moistureIcon}
				<SvgIcon type="mdi" path={moistureIcon} size="10" class="text-red-500 dark:text-red-400" />
			{/if}
			<span class="text-xs text-blue-700 dark:text-blue-300">Moisture</span>
		</div>

		<!-- Temperature -->
		<div class="flex items-center gap-1 rounded-lg bg-orange-50 p-2 dark:bg-orange-900/20">
			<SvgIcon
				type="mdi"
				path={mdiThermometer}
				size="12"
				class="text-orange-500 dark:text-orange-400"
			/>
			{#if temperatureIcon}
				<SvgIcon
					type="mdi"
					path={temperatureIcon}
					size="10"
					class="text-red-500 dark:text-red-400"
				/>
			{/if}
			<span class="text-xs text-orange-700 dark:text-orange-300">Temp</span>
		</div>

		<!-- Light -->
		<div class="flex items-center gap-1 rounded-lg bg-yellow-50 p-2 dark:bg-yellow-900/20">
			<SvgIcon
				type="mdi"
				path={mdiWhiteBalanceSunny}
				size="12"
				class="text-yellow-500 dark:text-yellow-400"
			/>
			{#if lightIcon}
				<SvgIcon type="mdi" path={lightIcon} size="10" class="text-red-500 dark:text-red-400" />
			{/if}
			<span class="text-xs text-yellow-700 dark:text-yellow-300">Light</span>
		</div>
	</div>

	<!-- Issues summary -->
	{#if entity.state === 'problem' && problems.length > 0}
		<div class="mt-3 rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
			<div class="flex items-center gap-2">
				<SvgIcon type="mdi" path={mdiAlert} size="14" class="text-red-500 dark:text-red-400" />
				<span class="text-sm font-medium text-red-700 dark:text-red-300">Needs attention:</span>
			</div>
			<div class="mt-1 text-xs text-red-600 dark:text-red-400">
				{problems.join(', ')}
			</div>
		</div>
	{/if}
</CardBase>
