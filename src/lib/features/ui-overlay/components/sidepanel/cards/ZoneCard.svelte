<script lang="ts">
	import SvgIcon from '@jamescoyle/svelte-icon/src/svg-icon.svelte';
	import { mdiMapMarker, mdiAccountMultiple, mdiRadiusOutline, mdiEarth } from '@mdi/js';
	import type { HassEntity } from 'home-assistant-js-websocket';
	import CardBase from './CardBase.svelte';

	interface Props {
		entity: HassEntity;
	}

	let { entity }: Props = $props();

	// Format coordinates for display
	const formatCoordinates = (lat: number, lng: number) => {
		return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
	};

	const personCount = $derived(parseInt(entity.state) || 0);
</script>

<CardBase
	{entity}
	icon={mdiMapMarker}
	showStatusDot={personCount > 0}
	primaryValue="{personCount} {personCount === 1 ? 'person' : 'people'}"
	secondaryText="{entity.attributes.passive ? 'Passive' : 'Active'} zone"
>
	<!-- Zone details -->
	<div class="space-y-2">
		<!-- Zone properties -->
		<div class="grid grid-cols-2 gap-2">
			<!-- Radius -->
			<div class="flex items-center gap-1 rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20">
				<SvgIcon
					type="mdi"
					path={mdiRadiusOutline}
					size="12"
					class="text-purple-500 dark:text-purple-400"
				/>
				<span class="text-xs text-purple-700 dark:text-purple-300">
					{entity.attributes.radius}m radius
				</span>
			</div>

			<!-- Location type -->
			<div class="flex items-center gap-1 rounded-lg bg-green-50 p-2 dark:bg-green-900/20">
				<SvgIcon type="mdi" path={mdiEarth} size="12" class="text-green-500 dark:text-green-400" />
				<span class="text-xs text-green-700 dark:text-green-300">
					{entity.attributes.editable ? 'Custom' : 'System'}
				</span>
			</div>
		</div>

		<!-- Coordinates -->
		<div class="flex items-center justify-between text-xs">
			<span class="text-gray-500 dark:text-gray-400">Coordinates</span>
			<span class="font-mono text-gray-700 dark:text-gray-300">
				{formatCoordinates(entity.attributes.latitude, entity.attributes.longitude)}
			</span>
		</div>

		<!-- Current occupants (if any) -->
		{#if entity.attributes.persons && entity.attributes.persons.length > 0}
			<div class="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
				<div class="mb-1 flex items-center gap-2">
					<SvgIcon
						type="mdi"
						path={mdiAccountMultiple}
						size="12"
						class="text-blue-500 dark:text-blue-400"
					/>
					<span class="text-xs font-medium text-blue-700 dark:text-blue-300">Currently here:</span>
				</div>
				<div class="text-xs text-blue-600 dark:text-blue-400">
					{entity.attributes.persons.join(', ')}
				</div>
			</div>
		{:else if personCount === 0}
			<div class="rounded-lg bg-gray-50 p-2 text-center dark:bg-gray-800">
				<span class="text-xs text-gray-500 dark:text-gray-400">No one here right now</span>
			</div>
		{/if}
	</div>
</CardBase>
