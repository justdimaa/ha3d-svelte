<script lang="ts">
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import { mdiAccount, mdiMapMarker, mdiCellphone } from '@mdi/js';
	import { homeApi } from '$lib/shared/stores/global';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import CardBase from './CardBase.svelte';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();

	// Get status color and info based on person state
	const getPresenceInfo = (state: string) => {
		switch (state.toLowerCase()) {
			case 'home':
				return {
					label: 'At Home',
					dotColor: 'bg-green-500 dark:bg-green-400'
				};
			case 'away':
				return {
					label: 'Away',
					dotColor: 'bg-orange-500 dark:bg-orange-400'
				};
			default:
				return {
					label: state.charAt(0).toUpperCase() + state.slice(1),
					dotColor: 'bg-blue-500 dark:bg-blue-400'
				};
		}
	};

	const presenceInfo = $derived(getPresenceInfo(entity.state));
	const deviceCount = $derived(entity.attributes.device_trackers?.length || 0);
	const sourceDevice = $derived(
		entity.attributes.source?.replace('device_tracker.', '') || 'unknown'
	);

	// Get picture URL if available
	const pictureUrl = $derived(
		entity.attributes.entity_picture
			? $homeApi?.options.auth?.data.hassUrl + entity.attributes.entity_picture
			: undefined
	);
</script>

<CardBase
	{entity}
	icon={mdiAccount}
	{pictureUrl}
	pictureAlt={entity.attributes.friendly_name}
	showStatusDot={true}
	statusDotColor={presenceInfo.dotColor}
	primaryValue={presenceInfo.label}
	secondaryText="Person • via {sourceDevice}"
>
	<!-- Presence details -->
	<div class="grid grid-cols-2 gap-2">
		<!-- Location info -->
		<div class="flex items-center gap-1 rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
			<SvgIcon type="mdi" path={mdiMapMarker} size="12" class="text-blue-500 dark:text-blue-400" />
			<span class="text-xs text-blue-700 dark:text-blue-300">
				{entity.attributes.gps_accuracy || 0}m accuracy
			</span>
		</div>

		<!-- Device count -->
		<div class="flex items-center gap-1 rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20">
			<SvgIcon
				type="mdi"
				path={mdiCellphone}
				size="12"
				class="text-purple-500 dark:text-purple-400"
			/>
			<span class="text-xs text-purple-700 dark:text-purple-300">
				{deviceCount} device{deviceCount !== 1 ? 's' : ''}
			</span>
		</div>
	</div>
</CardBase>
