<script lang="ts">
	import SvgIcon from '$lib/shared/components/SvgIcon.svelte';
	import {
		mdiCellphone,
		mdiMapMarker,
		mdiBatteryHigh,
		mdiBatteryMedium,
		mdiBatteryLow,
		mdiBatteryAlert
	} from '@mdi/js';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import CardBase from './CardBase.svelte';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();

	// Get battery icon and color based on level
	const getBatteryInfo = (level: number) => {
		if (level >= 80)
			return {
				icon: mdiBatteryHigh,
				color: 'text-green-600 dark:text-green-400',
				bg: 'bg-green-100 dark:bg-green-900/50'
			};
		if (level >= 50)
			return {
				icon: mdiBatteryMedium,
				color: 'text-yellow-600 dark:text-yellow-400',
				bg: 'bg-yellow-100 dark:bg-yellow-900/50'
			};
		if (level >= 20)
			return {
				icon: mdiBatteryLow,
				color: 'text-orange-600 dark:text-orange-400',
				bg: 'bg-orange-100 dark:bg-orange-900/50'
			};
		return {
			icon: mdiBatteryAlert,
			color: 'text-red-600 dark:text-red-400',
			bg: 'bg-red-100 dark:bg-red-900/50'
		};
	};

	// Get location status info
	const getLocationInfo = (state: string) => {
		switch (state.toLowerCase()) {
			case 'home':
				return {
					bg: 'bg-green-100 dark:bg-green-900/50',
					text: 'text-green-600 dark:text-green-400',
					icon: 'text-green-600 dark:text-green-400',
					label: 'At Home',
					dotColor: 'bg-green-500 dark:bg-green-400'
				};
			case 'away':
				return {
					bg: 'bg-gray-100 dark:bg-gray-700',
					text: 'text-gray-600 dark:text-gray-400',
					icon: 'text-gray-600 dark:text-gray-400',
					label: 'Away',
					dotColor: 'bg-gray-400 dark:bg-gray-500'
				};
			default:
				return {
					bg: 'bg-blue-100 dark:bg-blue-900/50',
					text: 'text-blue-600 dark:text-blue-400',
					icon: 'text-blue-600 dark:text-blue-400',
					label: state.charAt(0).toUpperCase() + state.slice(1),
					dotColor: 'bg-blue-500 dark:bg-blue-400'
				};
		}
	};

	// Get accuracy status
	const getAccuracyStatus = (accuracy: number) => {
		if (accuracy <= 10) return { color: 'text-green-600 dark:text-green-400', label: 'Excellent' };
		if (accuracy <= 50) return { color: 'text-yellow-600 dark:text-yellow-400', label: 'Good' };
		if (accuracy <= 100) return { color: 'text-orange-600 dark:text-orange-400', label: 'Fair' };
		return { color: 'text-red-600 dark:text-red-400', label: 'Poor' };
	};

	const batteryLevel = $derived(entity.attributes.battery_level || 0);
	const gpsAccuracy = $derived(entity.attributes.gps_accuracy || 0);
	const sourceType = $derived(entity.attributes.source_type || 'unknown');

	const batteryInfo = $derived(getBatteryInfo(batteryLevel));
	const locationInfo = $derived(getLocationInfo(entity.state));
	const accuracyStatus = $derived(getAccuracyStatus(gpsAccuracy));
</script>

<CardBase
	{entity}
	icon={mdiCellphone}
	showStatusDot={true}
	statusDotColor={locationInfo.dotColor}
	primaryValue={locationInfo.label}
	secondaryText={sourceType.toUpperCase()}
>
	<!-- Device details -->
	<div class="grid grid-cols-2 gap-2">
		<!-- Battery level -->
		<div class="flex items-center gap-1 rounded-lg {batteryInfo.bg} p-2 dark:bg-opacity-20">
			<SvgIcon type="mdi" path={batteryInfo.icon} size="12" class={batteryInfo.color} />
			<span class="text-xs font-medium {batteryInfo.color}">
				{batteryLevel}%
			</span>
		</div>

		<!-- GPS accuracy -->
		<div class="flex items-center gap-1 rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
			<SvgIcon type="mdi" path={mdiMapMarker} size="12" class="text-blue-500 dark:text-blue-400" />
			<span class="text-xs text-blue-700 dark:text-blue-300">
				±{gpsAccuracy}m
			</span>
		</div>
	</div>

	<!-- Location details -->
	<div class="mt-3 space-y-2">
		<!-- Accuracy status -->
		<div class="flex items-center justify-between text-xs">
			<span class="text-gray-500 dark:text-gray-400">GPS Accuracy</span>
			<span class="{accuracyStatus.color} font-medium">{accuracyStatus.label}</span>
		</div>

		<!-- Altitude -->
		{#if entity.attributes.altitude}
			<div class="flex items-center justify-between text-xs">
				<span class="text-gray-500 dark:text-gray-400">Altitude</span>
				<span class="text-gray-700 dark:text-gray-300"
					>{Math.round(entity.attributes.altitude)}m</span
				>
			</div>
		{/if}

		<!-- Vertical accuracy -->
		{#if entity.attributes.vertical_accuracy}
			<div class="flex items-center justify-between text-xs">
				<span class="text-gray-500 dark:text-gray-400">Vertical accuracy</span>
				<span class="text-gray-700 dark:text-gray-300">±{entity.attributes.vertical_accuracy}m</span
				>
			</div>
		{/if}
	</div>
</CardBase>
